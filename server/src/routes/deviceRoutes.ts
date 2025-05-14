import { Router } from 'express';
import { 
  getDeviceData, 
  getLatestReading,
  getHistoricalData,
  getDataByDateRange,
  getFallDetectionEvents,
  verifyDeviceId
} from '../controllers/deviceDataController';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController';

const router = Router();

// Device data routes
router.get('/data', getDeviceData);
router.get('/latest', getLatestReading);
router.get('/historical', getHistoricalData);
router.get('/range', getDataByDateRange);
router.get('/falls', getFallDetectionEvents);
router.get('/verify', verifyDeviceId); // Add new endpoint for device ID verification

// Notification routes
router.get('/notifications', getNotifications);
router.get('/notifications/unread', getUnreadCount);
router.put('/notifications/:id', markAsRead);
router.put('/notifications', markAllAsRead);

export default router;