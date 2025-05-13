import { ref, onValue, get, query, limitToLast, orderByChild } from 'firebase/database';
import { db } from '../config/firebase';
import { DeviceData } from '../types/deviceData';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/device';

// Get real-time updates for device data
export const subscribeToDeviceData = (callback: (data: DeviceData) => void) => {
  const deviceRef = ref(db, 'deviceData');
  
  const unsubscribe = onValue(deviceRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  
  return unsubscribe;
};

// Get the latest reading
export const getLatestReading = async (): Promise<DeviceData | null> => {
  try {
    const latestQuery = query(
      ref(db, 'deviceData'),
      orderByChild('location/timestamp'),
      limitToLast(1)
    );
    
    const snapshot = await get(latestQuery);
    if (snapshot.exists()) {
      // Extract the first (and only) child from the snapshot
      const data = Object.values(snapshot.val())[0] as DeviceData;
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return null;
  }
};

// New functions to interact with the MongoDB data via server API

// Get historical data with pagination
export const getHistoricalData = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/historical`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

// Get data for a specific date range
export const getDataByDateRange = async (startDate: string, endDate: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/range`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data for date range:', error);
    throw error;
  }
};