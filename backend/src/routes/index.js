const express = require('express');
const healthRoutes = require('./healthRoutes');
const newsRoutes = require('./newsRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/api/news', newsRoutes);
router.use('/api/uploads', uploadRoutes);

module.exports = router;
