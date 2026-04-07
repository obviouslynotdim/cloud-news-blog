const { streamImage, uploadImage } = require('../services/uploadService');

async function uploadNewsImage(req, res, next) {
  try {
    const result = await uploadImage(req.file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function proxyNewsImage(req, res, next) {
  try {
    const result = await streamImage(req.params.key);
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
}

module.exports = {
  uploadNewsImage,
  proxyNewsImage
};
