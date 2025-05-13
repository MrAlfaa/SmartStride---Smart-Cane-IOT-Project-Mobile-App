import { Router } from 'express';
import { 
  getDeviceData, 
  getLatestReading,
  getHistoricalData,
  getDataByDateRange
} from '../controllers/deviceDataController';

const router = Router();

// Existing Firebase routes
router.get('/data', getDeviceData);
router.get('/latest', getLatestReading);

// New MongoDB routes
router.get('/historical', getHistoricalData);
router.get('/range', getDataByDateRange);

export default router;