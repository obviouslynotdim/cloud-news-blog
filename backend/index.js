require('dotenv').config();

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'posts.json');
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const DATABASE_URL = process.env.DATABASE_URL;

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    })
  : null;

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

async function readPosts() {
  if (pool) {
    const result = await pool.query(
      `SELECT id, slug, title, summary, content, category, author, image_url AS "imageUrl", published_at AS "publishedAt"
       FROM posts
       ORDER BY published_at DESC`
    );
    return result.rows;
  }

  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const posts = JSON.parse(raw);
  return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function writePosts(posts) {
  if (pool) {
    return;
  }

  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

async function createPost(post) {
  if (pool) {
    const result = await pool.query(
      `INSERT INTO posts (id, slug, title, summary, content, category, author, image_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, slug, title, summary, content, category, author, image_url AS "imageUrl", published_at AS "publishedAt"`,
      [post.id, post.slug, post.title, post.summary, post.content, post.category, post.author, post.imageUrl, post.publishedAt]
    );

    return result.rows[0];
  }

  const posts = await readPosts();
  posts.unshift(post);
  await writePosts(posts);
  return post;
}

async function initDatabase() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      image_url TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL
    )
  `);

  const countResult = await pool.query('SELECT COUNT(*)::int AS total FROM posts');
  if (countResult.rows[0].total > 0) {
    return;
  }

  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const posts = JSON.parse(raw);
  for (const post of posts) {
    await pool.query(
      `INSERT INTO posts (id, slug, title, summary, content, category, author, image_url, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO NOTHING`,
      [post.id, post.slug, post.title, post.summary, post.content, post.category, post.author, post.imageUrl, post.publishedAt]
    );
  }
}

app.get('/api/news', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const category = (req.query.category || '').trim().toLowerCase();
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

    res.status(200).json({ count: filtered.length, posts: filtered });
  } catch (error) {
    next(error);
  }
});

app.get('/api/news/:slug', async (req, res, next) => {
  try {
    const posts = await readPosts();
    const post = posts.find((item) => item.slug === req.params.slug);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

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
    res.status(201).json({ post: savedPost });
  } catch (error) {
    next(error);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cloud-news-blog-backend' });
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
    if (pool) {
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
