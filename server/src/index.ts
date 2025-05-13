import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import deviceRoutes from './routes/deviceRoutes';
import connectDB from './config/mongodb';
import { initFirebaseToMongoSync } from './services/firebaseMongoSync';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start Firebase to MongoDB sync after successful MongoDB connection
    initFirebaseToMongoSync();
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/device', deviceRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});