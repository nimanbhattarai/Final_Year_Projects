require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration status but hide secrets
console.log('Cloudinary configuration:', {
  configured: !!process.env.CLOUDINARY_API_KEY,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // Don't log the actual keys
  api_key_provided: !!process.env.CLOUDINARY_API_KEY,
  api_secret_provided: !!process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary; 