const express = require('express');
const { createNews, getNewsBySlugHandler, getNewsList } = require('../controllers/newsController');

const router = express.Router();

router.get('/', getNewsList);
router.get('/:slug', getNewsBySlugHandler);
router.post('/', createNews);

module.exports = router;
