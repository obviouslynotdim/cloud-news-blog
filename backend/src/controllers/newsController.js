const { deleteNews, getNewsBySlug, listNews, publishNews, updateNews } = require('../services/newsService');

async function getNewsList(req, res, next) {
  try {
    const payload = await listNews(req.query);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

async function getNewsBySlugHandler(req, res, next) {
  try {
    const post = await getNewsBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
}

async function createNews(req, res, next) {
  try {
    const post = await publishNews(req.body);
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
}

async function updateNewsHandler(req, res, next) {
  try {
    const post = await updateNews(req.params.slug, req.body);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
}

async function deleteNewsHandler(req, res, next) {
  try {
    const deleted = await deleteNews(req.params.slug);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  deleteNewsHandler,
  getNewsList,
  getNewsBySlugHandler,
  createNews,
  updateNewsHandler
};
