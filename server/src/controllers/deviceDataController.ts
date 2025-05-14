import { Request, Response } from 'express';
import { db } from '../config/firebase';
import DeviceData from '../models/DeviceData';
import { getLatestDeviceReading, getDeviceDataHistory } from '../services/firebaseMongoSync';

// Get all device data from Firebase
export const getDeviceData = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.ref('/').once('value');
    const data = snapshot.val();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve device data' });
  }
};

// Get latest device reading
export const getLatestReading = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try MongoDB first (more reliable and structured)
    const mongoData = await getLatestDeviceReading();
    
    if (mongoData) {
      res.status(200).json(mongoData);
      return;
    }
    
    // Fallback to Firebase if MongoDB has no data
    const snapshot = await db.ref('/').once('value');
    const firebaseData = snapshot.val();
    
    if (!firebaseData) {
      res.status(404).json({ error: 'No device data available' });
      return;
    }
    
    res.status(200).json(firebaseData);
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({ error: 'Failed to retrieve latest reading' });
  }
};

// Get historical data
export const getHistoricalData = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await getDeviceDataHistory(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to retrieve historical data' });
  }
};

// Get data for a specific date range
export const getDataByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start and end dates are required' });
      return;
    }
    
    const startDateObj = new Date(startDate as string);
    const endDateObj = new Date(endDate as string);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    
    const data = await DeviceData.find({
      createdAt: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    }).sort({ createdAt: 1 });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data for date range:', error);
    res.status(500).json({ error: 'Failed to retrieve data for the specified date range' });
  }
};

// Get fall detection events
export const getFallDetectionEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const data = await DeviceData.find({
      'status.fall': 'detected'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await DeviceData.countDocuments({ 'status.fall': 'detected' });
    
    res.status(200).json({
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fall detection events:', error);
    res.status(500).json({ error: 'Failed to retrieve fall detection events' });
  }
};

// New endpoint to verify device ID
export const verifyDeviceId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.query;
    
    if (!deviceId) {
      res.status(400).json({ error: 'Device ID is required' });
      return;
    }
    
    // Special case for the demo device
    if (deviceId === 'SC-2334') {
      res.status(200).json({ valid: true });
      return;
    }
    
    // Check in MongoDB first
    const device = await DeviceData.findOne({ deviceId });
    
    if (device) {
      res.status(200).json({ valid: true });
      return;
    }
    
    // Fall back to Firebase
    const snapshot = await db.ref('/').once('value');
    const data = snapshot.val();
    
    if (data && data.deviceId === deviceId) {
      res.status(200).json({ valid: true });
      return;
    }
    
    res.status(200).json({ valid: false });
  } catch (error) {
    console.error('Error verifying device ID:', error);
    res.status(500).json({ error: 'Failed to verify device ID' });
  }
};