import axios from 'axios';
import { db, waitForFirebase } from '../config/firebase';
import { ref, onValue, get } from 'firebase/database';

// Change this to your actual server IP or use a dynamic approach
const API_BASE_URL = 'http://192.168.142.1:5000/api/device';// Replace with your actual IP

// Simple event system for notification changes
type NotificationChangeListener = () => void;
const notificationListeners: NotificationChangeListener[] = [];

export const subscribeToNotificationChanges = (callback: NotificationChangeListener) => {
  notificationListeners.push(callback);
  return () => {
    const index = notificationListeners.indexOf(callback);
    if (index > -1) {
      notificationListeners.splice(index, 1);
    }
  };
};

const notifyNotificationChange = () => {
  notificationListeners.forEach(listener => listener());
};

// Add fallback mechanism to use Firebase directly when server is unreachable
export interface Notification {
  _id: string;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
  deviceId: string;
  data: any;
}

// Helper function for API requests with retry
const safeApiRequest = async <T>(
  requestFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  maxRetries = 2
): Promise<T> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries) {
        console.log('API request failed after retries, using fallback');
        return fallbackFn();
      }
      console.log(`API request failed, retry ${i+1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
    }
  }
  return fallbackFn(); // TypeScript needs this, though it should never reach here
};

// Subscribe to fall detection in Firebase
export const subscribeTofallDetection = (callback: (fallDetected: boolean, location?: any) => void) => {
  // Wait for Firebase to be ready
  waitForFirebase().then(connected => {
    if (!connected || !db) {
      console.error('Firebase database is not initialized');
      return;
    }
    
    try {
      // Listen to the status path
      const statusRef = ref(db, '/status');
      
      const unsubscribe = onValue(statusRef, (snapshot) => {
        const statusData = snapshot.val();
        
        if (statusData && statusData.fall === 'detected') {
          // Also get location data
          if (!db) {
            callback(true); // Still notify, but without location
            return;
          }
          
          const locationRef = ref(db, '/location');
          onValue(locationRef, (locSnapshot) => {
            const locationData = locSnapshot.val();
            callback(true, locationData);
          }, { onlyOnce: true });
        } else {
          callback(false);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up fall detection listener:', error);
      return () => {}; // Return empty unsubscribe function
    }
  });
  
  return () => {}; // Return empty unsubscribe function for now
};

// Get all notifications with pagination
export const getNotifications = async (page = 1, limit = 20) => {
  return safeApiRequest(
    async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        params: { page, limit }
      });
      return response.data;
    },
    async () => {
      // Fallback to Firebase
      await waitForFirebase();
      
      if (!db) {
        console.error('Firebase database is not initialized');
        return { data: [], pagination: { total: 0, page, pages: 0 } };
      }
      
      try {
        // Check if we have a "fall": "detected" in the status
        const statusRef = ref(db, '/status');
        const locationRef = ref(db, '/location');
        
        const statusSnapshot = await get(statusRef);
        const locationSnapshot = await get(locationRef);
        
        const statusData = statusSnapshot.val();
        const locationData = locationSnapshot.val();
        
        // If fall is detected, create a notification object
        if (statusData && statusData.fall === 'detected') {
          const mockNotification: Notification = {
            _id: 'firebase-fallback-id',
            type: 'fall_detection',
            message: 'Your care recipient may have fallen! They may need immediate assistance.',
            timestamp: new Date(),
            read: false,
            deviceId: 'cane-device',
            data: { location: locationData }
          };
          
          return {
            data: [mockNotification],
            pagination: { total: 1, page: 1, pages: 1 }
          };
        }
        
        // Return empty data if no fall detected
        return { data: [], pagination: { total: 0, page, pages: 0 } };
      } catch (fbError) {
        console.error('Error fetching from Firebase:', fbError);
        return { data: [], pagination: { total: 0, page, pages: 0 } };
      }
    }
  );
};

// Get unread notification count
export const getUnreadCount = async () => {
  return safeApiRequest(
    async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread`);
      return response.data.count;
    },
    async () => {
      // Fallback to Firebase
      await waitForFirebase();
      
      if (!db) {
        console.error('Firebase database is not initialized');
        return 0;
      }
      
      try {
        // Check if we have a "fall": "detected" in the status
        const statusRef = ref(db, '/status');
        const snapshot = await get(statusRef);
        const statusData = snapshot.val();
        
        if (statusData && statusData.fall === 'detected') {
          return 1; // At least one notification (the fall detection)
        }
        return 0;
      } catch (fbError) {
        console.error('Error fetching from Firebase:', fbError);
        return 0;
      }
    }
  );
};

// Mark notification as read
export const markAsRead = async (id: string) => {
  return safeApiRequest(
    async () => {
      const response = await axios.put(`${API_BASE_URL}/notifications/${id}`);
      // Notify listeners that notifications have changed
      notifyNotificationChange();
      return response.data;
    },
    async () => {
      // If this is our fallback notification ID, just return a mock success
      if (id === 'firebase-fallback-id') {
        // Notify listeners that notifications have changed
        notifyNotificationChange();
        return {
          _id: 'firebase-fallback-id',
          type: 'fall_detection',
          message: 'Fall detected! Emergency assistance may be needed.',
          timestamp: new Date(),
          read: true,
          deviceId: 'cane-device'
        };
      }
      
      throw new Error('Could not mark notification as read');
    }
  );
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  return safeApiRequest(
    async () => {
      const response = await axios.put(`${API_BASE_URL}/notifications`);
      // Notify listeners that notifications have changed
      notifyNotificationChange();
      return response.data;
    },
    async () => {
      // Notify listeners that notifications have changed
      notifyNotificationChange();
      return { message: 'All notifications marked as read (Firebase fallback)' };
    }
  );
};