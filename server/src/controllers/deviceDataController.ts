import { Request, Response } from 'express';
import { db } from '../config/firebase';
import DeviceData from '../models/DeviceData';

// Get all device data from Firebase (existing function)
export const getDeviceData = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.ref('deviceData').once('value');
    const data = snapshot.val();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve device data' });
  }
};

// Get latest device reading from Firebase (existing function)
export const getLatestReading = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.ref('deviceData').orderByChild('location/timestamp').limitToLast(1).once('value');
    const data = snapshot.val();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve latest reading' });
  }
};

// New MongoDB-specific controllers

// Get historical data from MongoDB with pagination
export const getHistoricalData = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const data = await DeviceData.find()
      .sort({ 'location.timestamp': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await DeviceData.countDocuments();
    
    res.status(200).json({
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve historical data' });
  }
};

// Get data for a specific date range
export const getDataByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start and end dates are required' });
      return; // Remove the return of res.status().json() and just return nothing
    }
    
    const data = await DeviceData.find({
      'location.timestamp': {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ 'location.timestamp': 1 });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data for the specified date range' });
  }
};