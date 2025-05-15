import { ref, onValue, get, query, limitToLast, orderByChild } from 'firebase/database';
import { db, isConnected, initializeFirebase } from '../config/firebase';
import { DeviceData } from '../types/deviceData';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.142.1:5000/api/device'; // Use your server IP here

// Default device data to use when Firebase and API are unavailable
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
    lastConnected: Date.now(),
    fall: 'not detected'
  }
});

// Helper function to wait for Firebase connection
const waitForFirebase = async (timeout = 3000): Promise<boolean> => {
  try {
    const connected = await Promise.race([
      initializeFirebase(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeout))
    ]);
    return connected;
  } catch (error) {
    console.error('Error waiting for Firebase:', error);
    return false;
  }
};

// Get real-time updates for device data
export const subscribeToDeviceData = (callback: (data: DeviceData) => void) => {
  console.log('Setting up Firebase subscription...');
  
  // Return default data immediately while waiting for Firebase
  callback(getDefaultDeviceData());
  
  // Check if Firebase is connected
  waitForFirebase().then(connected => {
    if (!connected || !db) {
      console.warn('Firebase database not ready, using mock data');
      callback(getDefaultDeviceData());
      return;
    }
    
    try {
      console.log('Attempting to connect to Firebase...');
      
      // Query the root path
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
                  : Date.now(),
                address: data.location?.address
              },
              status: {
                connected: true,
                lastConnected: Date.now(),
                fall: data.status?.fall || 'not detected'
              },
              // Add other properties if available
              sensors: data.sensors,
              orientation: {
                acceleration: data.status?.orientation?.acceleration,
                pitch: data.status?.orientation?.pitch,
                roll: data.status?.orientation?.roll,
                vibration: data.status?.vibration
              }
            };
            
            console.log('Converted device data:', deviceData);
            console.log('Real-time data update received:', deviceData);
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
  });
  
  // Return a dummy unsubscribe function for now
  return () => {};
};

// Get the latest reading
export const getLatestReading = async (): Promise<DeviceData> => {
  try {
    console.log('Fetching latest reading from server/Firebase...');
    
    // Try to use the server API first with retry mechanism
    for (let i = 0; i < 3; i++) {
      try {
        const response = await axios.get(`${API_BASE_URL}/latest`);
        console.log('Retrieved latest data from server API:', response.data);
        
        // Convert MongoDB/server data format to DeviceData format
        const serverData = response.data;
        const deviceData: DeviceData = {
          deviceId: 'cane-device',
          battery: serverData.battery || 0,
          steps: serverData.steps || 0,
          distance: serverData.distance || 0,
          location: {
            latitude: serverData.location?.latitude || 0,
            longitude: serverData.location?.longitude || 0,
            timestamp: serverData.location?.timestamp 
              ? new Date(serverData.location.timestamp).getTime()
              : Date.now(),
            address: serverData.location?.address
          },
          status: {
            connected: true,
            lastConnected: Date.now(),
            fall: serverData.status?.fall || 'not detected'
          },
          sensors: serverData.sensors,
          orientation: {
            acceleration: serverData.status?.orientation?.acceleration,
            pitch: serverData.status?.orientation?.pitch,
            roll: serverData.status?.orientation?.roll,
            vibration: serverData.status?.vibration
          }
        };
        
        return deviceData;
      } catch (apiError) {
        if (i === 2) { // Last retry
          console.log('Could not retrieve data from API after retries, falling back to Firebase:', apiError);
        } else {
          console.log(`API request failed, retry ${i+1}/3`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    // Wait for Firebase connection before trying to use it
    await waitForFirebase();
    
    // If Firebase isn't connected or db is null, return default data
    if (!db) {
      console.warn('Firebase database instance is null, using mock data');
      return getDefaultDeviceData();
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
            : Date.now(),
          address: data.location?.address
        },
        status: {
          connected: true,
          lastConnected: Date.now(),
          fall: data.status?.fall || 'not detected'
        },
        sensors: data.sensors,
        orientation: {
          acceleration: data.status?.orientation?.acceleration,
          pitch: data.status?.orientation?.pitch,
          roll: data.status?.orientation?.roll,
          vibration: data.status?.vibration
        }
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

// Get fall detection events with pagination
export const getFallDetectionEvents = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/falls`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fall detection events:', error);
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