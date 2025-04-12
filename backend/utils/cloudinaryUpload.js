const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// Ensure cloudinary is configured with API keys directly here as well
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqdioiyq6',
  api_key: process.env.CLOUDINARY_API_KEY || '475618231342819',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v6-m3fuhvxz0k7O7Z6vHOMbkFlA',
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - Image file buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  // Log configuration status at upload time
  console.log('Cloudinary credentials check:', {
    cloud_name_set: !!cloudinary.config().cloud_name,
    api_key_set: !!cloudinary.config().api_key,
    api_secret_set: !!cloudinary.config().api_secret
  });
  
  return new Promise((resolve, reject) => {
    // Set default options
    const uploadOptions = {
      folder: 'student-photos',
      resource_type: 'image',
      ...options
    };
    
    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    // Pipe buffer to upload stream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };