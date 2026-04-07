require('dotenv').config();

const path = require('path');

const env = {
  port: Number(process.env.PORT) || 3000,
  frontendOrigin: process.env.FRONTEND_ORIGIN,
  frontendDist: path.join(__dirname, '..', '..', '..', 'frontend', 'dist'),
  s3BucketName: process.env.S3_BUCKET_NAME,
  s3Region: process.env.S3_REGION || process.env.AWS_REGION,
  defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE || 20),
  maxPageSize: Number(process.env.MAX_PAGE_SIZE || 50),
  cacheTtlMs: Number(process.env.CACHE_TTL_SECONDS || 20) * 1000
};

module.exports = env;
