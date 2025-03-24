const multer = require('multer');

// Use memory storage for better performance with Cloudinary
const storage = multer.memoryStorage();

// Validate file type and size
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  
  // All validation passed
  cb(null, true);
};

// Configure multer with constraints
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
  fileFilter: fileFilter,
});

module.exports = upload; 