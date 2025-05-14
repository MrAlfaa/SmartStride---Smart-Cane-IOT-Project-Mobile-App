import { Router } from 'express';
import { 
  getDeviceData, 
  getLatestReading,
  getHistoricalData,
  getDataByDateRange
} from '../controllers/deviceDataController';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController';

const router = Router();

// Existing Firebase routes
router.get('/data', getDeviceData);
router.get('/latest', getLatestReading);

// New MongoDB routes
router.get('/historical', getHistoricalData);
router.get('/range', getDataByDateRange);

// Notification routes - fix type errors
router.get('/notifications', getNotifications);
router.get('/notifications/unread', getUnreadCount);
router.put('/notifications/:id', markAsRead);
router.put('/notifications', markAllAsRead);

export default router;