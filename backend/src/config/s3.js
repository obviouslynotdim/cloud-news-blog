const { S3Client } = require('@aws-sdk/client-s3');
const env = require('./env');

function createS3Client() {
  if (!env.s3BucketName || !env.s3Region) {
    return null;
  }

  return new S3Client({ region: env.s3Region });
}

module.exports = {
  createS3Client
};
