import { db } from '../config/firebase';
import DeviceData from '../models/DeviceData';
import Notification from '../models/Notification';

// Initialize Firebase listener to sync data to MongoDB
export const initFirebaseToMongoSync = (): void => {
  console.log('Starting Firebase to MongoDB sync service...');
  
  const deviceDataRef = db.ref('deviceData');
  
  // Listen for new data added to Firebase
  deviceDataRef.on('child_added', async (snapshot) => {
    try {
      const firebaseId = snapshot.key;
      const deviceData = snapshot.val();
      
      // Check if this record already exists in MongoDB
      const existingRecord = await DeviceData.findOne({ firebaseId });
      
      if (!existingRecord) {
        // Create a new MongoDB document from the Firebase data
        const newDeviceData = new DeviceData({
          ...deviceData,
          firebaseId,
          createdAt: new Date()
        });
        
        await newDeviceData.save();
        console.log(`Data with ID ${firebaseId} synced to MongoDB`);
        
        // Check for fall detection and create notification if needed
        if (deviceData.status && deviceData.status.fall === 'detected') {
          const notification = new Notification({
            type: 'fall_detection',
            message: 'Your care recipient may have fallen! They may need immediate assistance.',
            timestamp: new Date(),
            read: false,
            deviceId: 'cane-device',
            data: {
              location: deviceData.location,
              timestamp: deviceData.location?.timestamp
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
  
  // Listen for updates to existing data
  deviceDataRef.on('child_changed', async (snapshot) => {
    try {
      const firebaseId = snapshot.key;
      const deviceData = snapshot.val();
      
      // Update existing record in MongoDB
      await DeviceData.findOneAndUpdate(
        { firebaseId },
        { ...deviceData, updatedAt: new Date() },
        { new: true }
      );
      
      console.log(`Data with ID ${firebaseId} updated in MongoDB`);
      
      // Check for fall detection in updated data
      if (deviceData.status && deviceData.status.fall === 'detected') {
        // Check if we already have a recent notification for this fall
        const recentNotification = await Notification.findOne({
          type: 'fall_detection',
          deviceId: 'cane-device',
          timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        });
        
        if (!recentNotification) {
          const notification = new Notification({
            type: 'fall_detection',
            message: 'Fall detected! Emergency assistance may be needed.',
            timestamp: new Date(),
            read: false,
            deviceId: 'cane-device',
            data: {
              location: deviceData.location,
              timestamp: deviceData.location?.timestamp
            }
          });
          
          await notification.save();
          console.log('Fall detection notification created from update');
        }
      }
    } catch (error) {
      console.error('Error updating data in MongoDB:', error);
    }
  });
  
  // Monitor root level for direct structure
  const rootRef = db.ref('/');
  rootRef.on('value', async (snapshot) => {
    try {
      const data = snapshot.val();
      
      // Check for fall detection from the root structure
      if (data && data.status && data.status.fall === 'detected') {
        // Check if we already have a recent notification for this fall
        const recentNotification = await Notification.findOne({
          type: 'fall_detection',
          deviceId: 'cane-device',
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
          console.log('Fall detection notification created from root data');
        }
      }
    } catch (error) {
      console.error('Error processing root data:', error);
    }
  });
  
  console.log('Firebase to MongoDB sync service started');
};