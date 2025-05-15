import axios from 'axios';
import { db } from '../config/firebase';
import { ref, get } from 'firebase/database';

const API_BASE_URL = 'http://192.168.142.1:5000/api/device';

// Verify if a device ID exists and is valid
export const verifyDeviceId = async (deviceId: string): Promise<boolean> => {
  try {
    // Special case for the demo device ID
    if (deviceId === 'SC-2334') {
      return true;
    }
    
    // Try server first
    try {
      const response = await axios.get(`${API_BASE_URL}/verify`, {
        params: { deviceId }
      });
      return response.data.valid;
    } catch (serverError) {
      console.log('Could not verify through server, trying Firebase:', serverError);
    }
    
    // Fallback to Firebase
    if (!db) {
      console.error('Firebase database is not initialized');
      return false;
    }
    
    const deviceRef = ref(db, '/');
    const snapshot = await get(deviceRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Check if the deviceId matches
      return data.deviceId === deviceId;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying device ID:', error);
    return false;
  }
};
