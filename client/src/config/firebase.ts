import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

export { app, db };