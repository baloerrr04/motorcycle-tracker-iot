// types/MotorCycleData.ts
export interface MotorcycleData {
    latitude: number | string;
    longitude: number | string;
    time: string;
    vibration: string;
    signal: number;
  }
  
  export interface MotorcycleLocationData extends MotorcycleData {
    deviceId: string;
  }
  
  export interface HistoricalLocation extends MotorcycleData {
    id: string;
  }