require('dotenv').config();

const fsSync = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GetObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { createPost, initDatabase, readPosts } = require('./database');

const app = express();
const port = Number(process.env.PORT) || 3000;
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_REGION = process.env.S3_REGION || process.env.AWS_REGION;
const DEFAULT_PAGE_SIZE = Number(process.env.DEFAULT_PAGE_SIZE || 20);
const MAX_PAGE_SIZE = Number(process.env.MAX_PAGE_SIZE || 50);
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_SECONDS || 20) * 1000;

const s3Client = S3_BUCKET_NAME && S3_REGION ? new S3Client({ region: S3_REGION }) : null;
const newsListCache = new Map();
const newsBySlugCache = new Map();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image files are allowed.'));
      return;
    }

    callback(null, true);
  }
});

app.use(express.json());

if (FRONTEND_ORIGIN) {
  app.use(
    cors({
      origin: FRONTEND_ORIGIN,
      methods: ['GET', 'POST', 'OPTIONS'],
      optionsSuccessStatus: 200
    })
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getFileExtensionFromMimeType(mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };

  return map[mimeType] || 'bin';
}

function getCached(cache, key) {
  const item = cache.get(key);
  if (!item) {
    return null;
  }

  if (Date.now() - item.cachedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function setCached(cache, key, value) {
  cache.set(key, { cachedAt: Date.now(), value });
}

function clearNewsCaches() {
  newsListCache.clear();
  newsBySlugCache.clear();
}

app.get('/api/news', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const category = (req.query.category || '').trim().toLowerCase();
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const requestedLimit = Number.parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);
    const cacheKey = `${q}|${category}|${page}|${limit}`;

    const cachedPayload = getCached(newsListCache, cacheKey);
    if (cachedPayload) {
      res.status(200).json(cachedPayload);
      return;
    }

    const posts = await readPosts();

    const filtered = posts.filter((post) => {
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q);
      const matchesCategory = !category || post.category.toLowerCase() === category;
      return matchesQuery && matchesCategory;
    });

    const total = filtered.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const normalizedPage = Math.min(page, totalPages);
    const offset = (normalizedPage - 1) * limit;
    const paginatedPosts = filtered.slice(offset, offset + limit);

    const payload = {
      count: paginatedPosts.length,
      total,
      page: normalizedPage,
      limit,
      totalPages,
      posts: paginatedPosts
    };

    setCached(newsListCache, cacheKey, payload);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

app.get('/api/news/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const cachedPost = getCached(newsBySlugCache, slug);
    if (cachedPost) {
      res.status(200).json({ post: cachedPost });
      return;
    }

    const posts = await readPosts();
    const post = posts.find((item) => item.slug === slug);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    setCached(newsBySlugCache, slug, post);
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
});

app.post('/api/news', async (req, res, next) => {
  try {
    const { title, summary, category, author, imageUrl, content } = req.body;

    if (!title || !summary || !category || !author || !imageUrl || !content) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
      return;
    }

    const posts = await readPosts();
    const baseSlug = slugify(title);
    const slugExists = posts.some((post) => post.slug === baseSlug);
    const slug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-5)}` : baseSlug;

    const newPost = {
      id: `post-${Date.now()}`,
      slug,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category: category.trim(),
      author: author.trim(),
      imageUrl: imageUrl.trim(),
      publishedAt: new Date().toISOString()
    };

    const savedPost = await createPost(newPost);
    clearNewsCaches();
    res.status(201).json({ post: savedPost });
  } catch (error) {
    next(error);
  }
});

app.post('/api/uploads/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!s3Client) {
      res.status(500).json({ error: 'S3 upload is not configured. Set S3_BUCKET_NAME and S3_REGION.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Image file is required.' });
      return;
    }

    const ext = getFileExtensionFromMimeType(req.file.mimetype);
    const baseName = slugify(path.parse(req.file.originalname).name || 'news-image');
    const key = `news-images/${Date.now()}-${baseName}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
    );

    const imageUrl = `/api/uploads/image/${encodeURIComponent(key)}`;
    res.status(201).json({ imageUrl, key });
  } catch (error) {
    next(error);
  }
});

app.get('/api/uploads/image/:key', async (req, res, next) => {
  try {
    if (!s3Client) {
      res.status(500).json({ error: 'S3 image proxy is not configured.' });
      return;
    }

    const key = req.params.key;
    const result = await s3Client.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key
      })
    );

    if (result.ContentType) {
      res.setHeader('Content-Type', result.ContentType);
    }

    if (!result.Body) {
      res.status(404).json({ error: 'Image not found.' });
      return;
    }

    result.Body.pipe(res);
  } catch (error) {
    next(error);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'global-blog-news-backend' });
});

if (fsSync.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      next();
      return;
    }

    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong' });
});

async function startServer() {
  await initDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on port ${port}`);
    if (process.env.DATABASE_URL) {
      console.log('Using PostgreSQL storage');
    } else {
      console.log('Using local JSON storage');
    }
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
