import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, ref, onValue, Database } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXpbk1PZS4lC8RvA3EBamwOw90JRCJR5g",
  authDomain: "smart-cane-57954.firebaseapp.com",
  databaseURL: "https://smart-cane-57954-default-rtdb.firebaseio.com",
  projectId: "smart-cane-57954",
  storageBucket: "smart-cane-57954.firebasestorage.app",
  messagingSenderId: "253612217427",
  appId: "1:253612217427:web:09189e7bbffec4d50f62a6",
  measurementId: "G-LB07FPLF87"
};

// Declare variables at the top level with explicit types
let app: FirebaseApp | null = null;
let db: Database | null = null;
let isConnected: boolean = false;
let connectionPromise: Promise<boolean> | null = null;

// Create a promise to track Firebase initialization
const initializeFirebase = (): Promise<boolean> => {
  if (connectionPromise) {
    return connectionPromise;
  }
  
  connectionPromise = new Promise((resolve) => {
    try {
      console.log('Initializing Firebase with config:', JSON.stringify(firebaseConfig));
      app = initializeApp(firebaseConfig);
      
      // Initialize Realtime Database and get a reference to the service
      db = getDatabase(app);
      
      // Monitor connection state
      const connectedRef = ref(db, '.info/connected');
      onValue(connectedRef, (snap) => {
        isConnected = snap.val() === true;
        console.log('Firebase connection state:', isConnected ? 'connected' : 'disconnected');
        
        if (isConnected) {
          resolve(true);
        }
      });
      
      // Set a timeout to resolve even if connection doesn't establish
      setTimeout(() => {
        if (!isConnected) {
          console.warn('Firebase connection timeout - proceeding anyway');
          resolve(false);
        }
      }, 5000);
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      app = null;
      db = null;
      isConnected = false;
      resolve(false);
    }
  });
  
  return connectionPromise;
};

// Start initialization immediately
initializeFirebase();

// Helper function to wait for Firebase connection
export const waitForFirebase = async (timeout = 3000): Promise<boolean> => {
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

// Export the variables and initialization function
export { app, db, isConnected, initializeFirebase };
