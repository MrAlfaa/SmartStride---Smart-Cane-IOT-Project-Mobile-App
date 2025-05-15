import { db } from '../config/firebase';
import DeviceData from '../models/DeviceData';
import Notification from '../models/Notification';

// Initialize Firebase listener to sync data to MongoDB
export const initFirebaseToMongoSync = (): void => {
  console.log('Starting Firebase to MongoDB sync service...');
  
  // Listen to the root node for all data changes
  const rootRef = db.ref('/');
  
  // Track the last timestamp we synced to avoid duplicate entries
  let lastSyncTimestamp: string = '';
  
  // Set up a value listener to catch all changes
  rootRef.on('value', async (snapshot) => {
    try {
      const data = snapshot.val();
      
      // If no data, exit early
      if (!data) {
        console.log('No data available in Firebase');
        return;
      }
      
      // Skip if the timestamp is the same as our last sync
      // This prevents duplicate entries when data hasn't changed
      if (data.location?.timestamp === lastSyncTimestamp) {
        console.log('Data timestamp unchanged, skipping sync');
        return;
      }
      
      // Update our last sync timestamp
      lastSyncTimestamp = data.location?.timestamp || '';
      
      console.log('New data received from Firebase:', JSON.stringify(data, null, 2));
      
      // Create a new device data document
      const newDeviceData = new DeviceData({
        location: {
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0,
          timestamp: data.location?.timestamp || new Date().toISOString()
        },
        sensors: {
          ultrasonic1: data.sensors?.ultrasonic1 || 'no data',
          ultrasonic2: data.sensors?.ultrasonic2 || 'no data'
        },
        status: {
          fall: data.status?.fall || 'not detected',
          orientation: {
            acceleration: data.status?.orientation?.acceleration,
            pitch: data.status?.orientation?.pitch,
            roll: data.status?.orientation?.roll
          },
          vibration: data.status?.vibration
        },
        battery: data.battery,
        steps: data.steps,
        distance: data.distance,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Save the document to MongoDB
      await newDeviceData.save();
      console.log(`Data saved to MongoDB with ID: ${newDeviceData._id}`);
      
      // Check for fall detection and create notification if needed
      if (data.status && data.status.fall === 'detected') {
        // Check if we've already created a notification for this fall event
        // (within the last 5 minutes)
        const recentNotification = await Notification.findOne({
          type: 'fall_detection',
          timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        });
        
        if (!recentNotification) {
          const notification = new Notification({
            type: 'fall_detection',
            message: 'Your care recipient may have fallen! They may need immediate assistance.',
            timestamp: new Date(),
            read: false,
            deviceId: 'cane-device',
            data: {
              location: data.location,
              timestamp: data.location?.timestamp
            }
          });
          
          await notification.save();
          console.log('Fall detection notification created');
        }
      }
    } catch (error) {
      console.error('Error syncing data to MongoDB:', error);
    }
  });
  
  // Set up periodic sync to ensure we capture all data
  // This runs every 5 minutes as a fallback
  setInterval(async () => {
    try {
      const snapshot = await rootRef.once('value');
      const data = snapshot.val();
      
      if (!data) {
        console.log('No data available in periodic sync');
        return;
      }
      
      // Skip if the timestamp is the same as our last sync
      if (data.location?.timestamp === lastSyncTimestamp) {
        console.log('Data timestamp unchanged in periodic sync, skipping');
        return;
      }
      
      // Update our last sync timestamp
      lastSyncTimestamp = data.location?.timestamp || '';
      
      console.log('Periodic sync: New data found in Firebase');
      
      // Create a new device data document
      const newDeviceData = new DeviceData({
        location: {
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0,
          timestamp: data.location?.timestamp || new Date().toISOString()
        },
        sensors: {
          ultrasonic1: data.sensors?.ultrasonic1 || 'no data',
          ultrasonic2: data.sensors?.ultrasonic2 || 'no data'
        },
        status: {
          fall: data.status?.fall || 'not detected',
          orientation: {
            acceleration: data.status?.orientation?.acceleration,
            pitch: data.status?.orientation?.pitch,
            roll: data.status?.orientation?.roll
          },
          vibration: data.status?.vibration
        },
        battery: data.battery,
        steps: data.steps,
        distance: data.distance,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newDeviceData.save();
      console.log(`Periodic sync: Data saved to MongoDB with ID: ${newDeviceData._id}`);
    } catch (error) {
      console.error('Error in periodic sync:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('Firebase to MongoDB sync service started');
};

// Export helper functions to get data from MongoDB
export const getLatestDeviceReading = async () => {
  try {
    return await DeviceData.findOne().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting latest device reading:', error);
    return null;
  }
};

export const getDeviceDataHistory = async (page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const data = await DeviceData.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await DeviceData.countDocuments();
    
    return {
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting device data history:', error);
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