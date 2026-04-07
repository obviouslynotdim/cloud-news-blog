const path = require('path');
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');
const { createS3Client } = require('../config/s3');
const { getFileExtensionFromMimeType, slugify } = require('../utils/slug');

const s3Client = createS3Client();

async function uploadImage(file) {
  if (!s3Client) {
    const error = new Error('S3 upload is not configured. Set S3_BUCKET_NAME and S3_REGION.');
    error.statusCode = 500;
    throw error;
  }

  if (!file) {
    const error = new Error('Image file is required.');
    error.statusCode = 400;
    throw error;
  }

  const ext = getFileExtensionFromMimeType(file.mimetype);
  const baseName = slugify(path.parse(file.originalname).name || 'news-image');
  const key = `news-images/${Date.now()}-${baseName}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3BucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  );

  return {
    key,
    imageUrl: `/api/uploads/image/${encodeURIComponent(key)}`
  };
}

async function streamImage(key) {
  if (!s3Client) {
    const error = new Error('S3 image proxy is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.s3BucketName,
      Key: key
    })
  );

  return result;
}

module.exports = {
  uploadImage,
  streamImage
};
