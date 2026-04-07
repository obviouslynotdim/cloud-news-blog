function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'Image size must be less than 8MB.' });
    return;
  }

  if (error.message === 'Only image files are allowed.') {
    res.status(400).json({ error: error.message });
    return;
  }

  const statusCode = error.statusCode || 500;
  const message = error.statusCode ? error.message : 'Something went wrong';
  res.status(statusCode).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
