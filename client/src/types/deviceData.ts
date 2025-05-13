export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  address?: string;
}

export interface Sensors {
  ultrasonic1: string;
  ultrasonic2: string;
}

export interface Status {
  fall: string;
}

export interface Orientation {
  acceleration: number;
  pitch: number;
  roll: number;
  vibration: string;
}

export interface DeviceData {
  id?: string;
  firebaseId?: string;
  deviceId: string;
  battery: number;
  steps: number;
  distance: number;
  location: Location;
  obstacles?: {
    detected: boolean;
    count: number;
    lastDetected?: number;
  };
  status: {
    connected: boolean;
    lastConnected: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}