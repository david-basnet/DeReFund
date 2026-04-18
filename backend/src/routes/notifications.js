const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', authenticate, notificationController.getMyNotifications);
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

module.exports = router;
