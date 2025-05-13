import { db } from '../config/firebase';
import DeviceData from '../models/DeviceData';

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
    } catch (error) {
      console.error('Error updating data in MongoDB:', error);
    }
  });
  
  console.log('Firebase to MongoDB sync service started');
};