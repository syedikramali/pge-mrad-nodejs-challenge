require("dotenv").config();

if (!process.env.S3_BUCKET || !process.env.REGION || !process.env.API_TOKEN) {
  throw new Error("Missing required environment variables!");
}

module.exports = {
  S3_BUCKET: process.env.S3_BUCKET,
  REGION: process.env.REGION || "us-east-2",
  API_TOKEN: process.env.API_TOKEN,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  IS_LAMBDA: process.env.IS_LAMBDA,
};
