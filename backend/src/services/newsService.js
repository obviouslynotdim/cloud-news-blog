const { createPost, deletePostBySlug, readPosts, updatePostBySlug } = require('../../database');
const env = require('../config/env');
const { TimedCache } = require('../utils/cache');
const { slugify } = require('../utils/slug');

const newsListCache = new TimedCache(env.cacheTtlMs);
const newsBySlugCache = new TimedCache(env.cacheTtlMs);

function clearNewsCaches() {
  newsListCache.clear();
  newsBySlugCache.clear();
}

async function listNews(query) {
  const q = (query.q || '').trim().toLowerCase();
  const category = (query.category || '').trim().toLowerCase();
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || env.defaultPageSize;
  const limit = Math.min(Math.max(requestedLimit, 1), env.maxPageSize);
  const cacheKey = `${q}|${category}|${page}|${limit}`;

  const cachedPayload = newsListCache.get(cacheKey);
  if (cachedPayload) {
    return cachedPayload;
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

  newsListCache.set(cacheKey, payload);
  return payload;
}

async function getNewsBySlug(slug) {
  const cachedPost = newsBySlugCache.get(slug);
  if (cachedPost) {
    return cachedPost;
  }

  const posts = await readPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) {
    return null;
  }

  newsBySlugCache.set(slug, post);
  return post;
}

async function publishNews(data) {
  const title = (data.title || '').trim();
  const summary = (data.summary || '').trim();
  const category = (data.category || '').trim();
  const author = (data.author || '').trim();
  const imageUrl = (data.imageUrl || '').trim();
  const content = (data.content || '').trim();

  if (!title || !summary || !category || !author || !imageUrl || !content) {
    const error = new Error('Please fill in all required fields.');
    error.statusCode = 400;
    throw error;
  }

  const posts = await readPosts();
  const baseSlug = slugify(title);
  const slugExists = posts.some((post) => post.slug === baseSlug);
  const slug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-5)}` : baseSlug;

  const newPost = {
    id: `post-${Date.now()}`,
    slug,
    title,
    summary,
    content,
    category,
    author,
    imageUrl,
    publishedAt: new Date().toISOString()
  };

  const savedPost = await createPost(newPost);
  clearNewsCaches();
  return savedPost;
}

async function updateNews(slug, data) {
  const post = await getNewsBySlug(slug);
  if (!post) {
    return null;
  }

  const updates = {};
  const fields = ['title', 'summary', 'category', 'author', 'content', 'imageUrl'];

  for (const field of fields) {
    if (typeof data[field] === 'undefined') {
      continue;
    }

    const value = String(data[field]).trim();
    if (!value) {
      const error = new Error(`${field} cannot be empty.`);
      error.statusCode = 400;
      throw error;
    }

    updates[field] = value;
  }

  if (Object.keys(updates).length === 0) {
    return post;
  }

  const updatedPost = await updatePostBySlug(slug, updates);
  clearNewsCaches();
  return updatedPost;
}

async function deleteNews(slug) {
  const deleted = await deletePostBySlug(slug);
  if (!deleted) {
    return false;
  }

  clearNewsCaches();
  return true;
}

module.exports = {
  deleteNews,
  listNews,
  getNewsBySlug,
  publishNews,
  updateNews
};
