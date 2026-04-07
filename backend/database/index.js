const fs = require('fs/promises');
const path = require('path');
const { Sequelize } = require('sequelize');
const definePostModel = require('../models/Post');

const DATA_FILE = path.join(__dirname, '..', 'data', 'posts.json');
const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : undefined
    })
  : null;

const Post = sequelize ? definePostModel(sequelize) : null;

function normalizePost(post) {
  if (!post) {
    return null;
  }

  if (typeof post.toJSON === 'function') {
    const json = post.toJSON();
    return {
      id: json.id,
      slug: json.slug,
      title: json.title,
      summary: json.summary,
      content: json.content,
      category: json.category,
      author: json.author,
      imageUrl: json.imageUrl,
      publishedAt: json.publishedAt
    };
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    content: post.content,
    category: post.category,
    author: post.author,
    imageUrl: post.imageUrl,
    publishedAt: post.publishedAt
  };
}

async function readPostsFromJson() {
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const posts = JSON.parse(raw);
  return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function writePostsToJson(posts) {
  await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

async function readPosts() {
  if (Post) {
    const posts = await Post.findAll({ order: [['publishedAt', 'DESC']] });
    return posts.map(normalizePost);
  }

  return readPostsFromJson();
}

async function createPost(post) {
  if (Post) {
    const created = await Post.create(post);
    return normalizePost(created);
  }

  const posts = await readPostsFromJson();
  posts.unshift(post);
  await writePostsToJson(posts);
  return post;
}

async function initDatabase() {
  if (!Post) {
    return;
  }

  await sequelize.authenticate();
  await sequelize.sync();

  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const posts = JSON.parse(raw);
  await Post.bulkCreate(posts.map(normalizePost), { ignoreDuplicates: true });
}

module.exports = {
  createPost,
  initDatabase,
  readPosts,
  sequelize
};