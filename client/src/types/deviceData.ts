export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
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
  location: Location;
  sensors: Sensors;
  status: Status;
  orientation: Orientation;
}