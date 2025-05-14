export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number | string;
  address?: string;
}

export interface Sensors {
  ultrasonic1: string;
  ultrasonic2: string;
}

export interface Status {
  connected: boolean;
  lastConnected: number;
  fall?: string;
}

export interface Orientation {
  acceleration?: number;
  pitch?: number;
  roll?: number;
  vibration?: string;
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
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;
  // Add the new properties that match the Firebase data structure
  sensors?: Sensors;
  orientation?: Orientation;
}