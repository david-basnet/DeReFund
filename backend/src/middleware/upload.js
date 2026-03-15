const multer = require('multer');
const path = require('path');

// Configure storage for file uploads
const storage = multer.memoryStorage(); // Store files in memory (can be changed to disk storage)

// File filter for documents (PDF, DOC, DOCX, images)
const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPEG, JPG, and PNG files are allowed'));
  }
};

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed'));
  }
};

// Upload middleware for single document
const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: documentFilter
}).single('document');

// Upload middleware for multiple images
const uploadImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file, max 10 files
  fileFilter: imageFilter
}).array('images', 10);

module.exports = {
  uploadDocument,
  uploadImages
};

