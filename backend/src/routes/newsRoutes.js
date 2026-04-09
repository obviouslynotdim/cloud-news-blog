const express = require('express');
const { createNews, deleteNewsHandler, getNewsBySlugHandler, getNewsList, updateNewsHandler } = require('../controllers/newsController');

const router = express.Router();

router.get('/', getNewsList);
router.get('/:slug', getNewsBySlugHandler);
router.post('/', createNews);
router.put('/:slug', updateNewsHandler);
router.delete('/:slug', deleteNewsHandler);

module.exports = router;
