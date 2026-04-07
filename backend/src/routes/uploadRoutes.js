const express = require('express');
const { proxyNewsImage, uploadNewsImage } = require('../controllers/uploadController');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post('/image', upload.single('image'), uploadNewsImage);
router.get('/image/:key', proxyNewsImage);

module.exports = router;
