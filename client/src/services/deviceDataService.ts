import { ref, onValue, get, query, limitToLast, orderByChild } from 'firebase/database';
import { db, isConnected } from '../config/firebase';
import { DeviceData } from '../types/deviceData';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/device';

// Default device data to use when Firebase is unavailable
const getDefaultDeviceData = (): DeviceData => ({
  deviceId: 'unknown',
  battery: 0,
  steps: 0,
  distance: 0,
  location: {
    latitude: 0,
    longitude: 0,
    timestamp: Date.now()
  },
  status: {
    connected: false,
    lastConnected: Date.now()
  }
});

// Get real-time updates for device data
export const subscribeToDeviceData = (callback: (data: DeviceData) => void) => {
  try {
    console.log('Attempting to connect to Firebase...');
    
    // If Firebase isn't connected, return default data right away
    if (!db) {
      console.warn('Firebase database instance is null, using mock data');
      callback(getDefaultDeviceData());
      return () => {}; // Return empty unsubscribe function
    }
    
    // Query the root path instead of 'deviceData'
    const rootRef = ref(db, '/');
    
    const unsubscribe = onValue(
      rootRef, 
      (snapshot) => {
        try {
          const data = snapshot.val();
          console.log('Firebase snapshot received:', data);
          
          // Handle null data gracefully
          if (!data) {
            console.log('No data available in Firebase');
            callback(getDefaultDeviceData());
            return;
          }
          
          // Create a DeviceData object from the root data
          const deviceData: DeviceData = {
            deviceId: 'cane-device',
            battery: data.battery || 0,
            steps: data.steps || 0,
            distance: data.distance || 0,
            location: {
              latitude: data.location?.latitude || 0,
              longitude: data.location?.longitude || 0,
              timestamp: data.location?.timestamp 
                ? new Date(data.location.timestamp).getTime()
                : Date.now()
            },
            status: {
              connected: true,
              lastConnected: Date.now()
            },
            // Add other properties if available
            sensors: data.sensors,
            orientation: data.orientation
          };
          
          console.log('Converted device data:', deviceData);
          callback(deviceData);
        } catch (error) {
          console.error('Error processing Firebase data:', error);
          callback(getDefaultDeviceData());
        }
      },
      (error) => {
        console.error('Firebase data subscription error:', error);
        callback(getDefaultDeviceData());
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Failed to set up Firebase subscription:', error);
    // Return default data and dummy unsubscribe function
    callback(getDefaultDeviceData());
    return () => {};
  }
};

// Get the latest reading
export const getLatestReading = async (): Promise<DeviceData> => {
  try {
    console.log('Fetching latest reading from Firebase...');
    
    // If Firebase isn't connected or db is null, return default data
    if (!db) {
      console.warn('Firebase database instance is null, using mock data');
      return getDefaultDeviceData();
    }
    
    // Try to use the server API first
    try {
      const response = await axios.get(`${API_BASE_URL}/latest`);
      console.log('Retrieved latest data from server API:', response.data);
      return response.data;
    } catch (apiError) {
      console.log('Could not retrieve data from API, falling back to Firebase:', apiError);
    }
    
    // Get data directly from the root
    const rootRef = ref(db, '/');
    
    const snapshot = await get(rootRef);
    console.log('Latest reading snapshot exists:', snapshot.exists());
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Create a DeviceData object from the root data
      const deviceData: DeviceData = {
        deviceId: 'cane-device',
        battery: data.battery || 0,
        steps: data.steps || 0,
        distance: data.distance || 0,
        location: {
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0,
          timestamp: data.location?.timestamp 
            ? new Date(data.location.timestamp).getTime()
            : Date.now()
        },
        status: {
          connected: true,
          lastConnected: Date.now()
        },
        // Add other properties if available
        sensors: data.sensors,
        orientation: data.orientation
      };
      
      console.log('Converted device data:', deviceData);
      return deviceData;
    }
    
    // Return default data if no data is available
    return getDefaultDeviceData();
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return getDefaultDeviceData();
  }
};

// Get historical data with pagination
export const getHistoricalData = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/historical`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return empty data with pagination info
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        pages: 0
      }
    };
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
    return [];
  }
};