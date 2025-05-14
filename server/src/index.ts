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

// Middleware - ensure CORS is properly configured
app.use(cors({
  origin: '*', // In production, restrict this to your app's domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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