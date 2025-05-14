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

// Initialize Firebase with error handling
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
  });
  
  // Log a test query to see database structure
  const testRef = ref(db, '/');
  onValue(testRef, (snapshot) => {
    console.log('Database root structure:', JSON.stringify(snapshot.val(), null, 2));
  }, (error) => {
    console.error('Error reading database structure:', error);
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  app = null;
  db = null;
  isConnected = false;
}

// Export the variables at the top level
export { app, db, isConnected };
