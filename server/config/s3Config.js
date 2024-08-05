// config/s3Config.js
const { S3Client } = require("@aws-sdk/client-s3");
const { fromEnv } = require("@aws-sdk/credential-provider-env");

// Create an S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_REGION, // Ensure this is set to your bucket's region
  credentials: fromEnv(), // Loads credentials from environment variables
});

module.exports = s3;