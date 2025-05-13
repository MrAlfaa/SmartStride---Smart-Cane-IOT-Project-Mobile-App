import mongoose, { Document, Schema } from 'mongoose';

// Define the MongoDB schema based on the existing Firebase data structure
interface ILocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface ISensors {
  ultrasonic1: string;
  ultrasonic2: string;
}

interface IStatus {
  fall: string;
}

interface IOrientation {
  acceleration: number;
  pitch: number;
  roll: number;
  vibration: string;
}

export interface IDeviceData extends Document {
  location: ILocation;
  sensors: ISensors;
  status: IStatus;
  orientation: IOrientation;
  firebaseId?: string;
  createdAt: Date;
}

const DeviceDataSchema = new Schema<IDeviceData>({
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: String, required: true }
  },
  sensors: {
    ultrasonic1: { type: String, required: true },
    ultrasonic2: { type: String, required: true }
  },
  status: {
    fall: { type: String, required: true }
  },
  orientation: {
    acceleration: { type: Number, required: true },
    pitch: { type: Number, required: true },
    roll: { type: Number, required: true },
    vibration: { type: String, required: true }
  },
  firebaseId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create index on timestamp for efficient querying of historical data
DeviceDataSchema.index({ 'location.timestamp': 1 });

const DeviceData = mongoose.model<IDeviceData>('DeviceData', DeviceDataSchema);

export default DeviceData;