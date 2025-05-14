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

interface IOrientation {
  acceleration: number;
  pitch: number;
  roll: number;
}

interface IStatus {
  fall: string;
  orientation?: IOrientation;
  vibration?: string;
}

export interface IDeviceData extends Document {
  location: ILocation;
  sensors: ISensors;
  status: IStatus;
  battery?: number;
  steps?: number;
  distance?: number;
  firebaseId?: string;
  createdAt: Date;
  updatedAt?: Date;
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
    fall: { type: String, required: true },
    orientation: {
      acceleration: { type: Number },
      pitch: { type: Number },
      roll: { type: Number }
    },
    vibration: { type: String }
  },
  battery: { type: Number },
  steps: { type: Number },
  distance: { type: Number },
  firebaseId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Create indexes for efficient querying
DeviceDataSchema.index({ 'location.timestamp': 1 });
DeviceDataSchema.index({ createdAt: 1 });
DeviceDataSchema.index({ 'status.fall': 1 });

const DeviceData = mongoose.model<IDeviceData>('DeviceData', DeviceDataSchema);

export default DeviceData;