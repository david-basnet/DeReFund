const notificationService = require('../services/notificationService');
const { formatResponse } = require('../utils/helpers');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getByUser(req.user.userId);
    res.json(formatResponse(true, 'Notifications retrieved successfully', { notifications }));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId, req.user.userId);
    if (!notification) {
      return res.status(404).json(formatResponse(false, 'Notification not found'));
    }
    res.json(formatResponse(true, 'Notification marked as read', { notification }));
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.deleteNotification(notificationId, req.user.userId);
    if (!notification) {
      return res.status(404).json(formatResponse(false, 'Notification not found'));
    }
    res.json(formatResponse(true, 'Notification deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  deleteNotification,
};
