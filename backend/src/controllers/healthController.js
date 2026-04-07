function getHealth(req, res) {
  res.status(200).json({ status: 'ok', service: 'global-blog-news-backend' });
}

module.exports = {
  getHealth
};
