const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadDocument, uploadImages } = require('../middleware/upload');
const {
  uploadNGODocument,
  getNGODocument,
  uploadDisasterImages,
  getDisasterImage
} = require('../controllers/uploadController');

// Upload NGO verification document
router.post('/ngo/document', authenticate, uploadDocument, uploadNGODocument);

// Get NGO verification document
router.get('/ngo/document/:userId', authenticate, getNGODocument);

// Upload disaster images
router.post('/disaster/images', authenticate, uploadImages, uploadDisasterImages);

// Get disaster image
router.get('/disaster/image/:caseId/:imageIndex', getDisasterImage);

module.exports = router;

