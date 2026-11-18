export type DeviceStatus = 'online' | 'offline' | 'connecting' | 'warning' | 'error';
export type CameraStatus = 'active' | 'inactive' | 'streaming' | 'error';
export type WifiStatus = 'connected' | 'disconnected' | 'connecting';

export interface Esp32Telemetry {
  freeHeapBytes: number;
  totalHeapBytes: number;
  freePsramBytes: number;
  totalPsramBytes: number;
  cpuFreqMhz: number;
  temperatureCelsius: number;
  wifiRssiDbm: number;
  fps: number;
  uptimeSeconds: number;
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: string; // "ESP32-S3-WROOM-1 N16R8"
  location: string;
  ipAddress: string;
  macAddress: string;
  status: DeviceStatus;
  cameraStatus: CameraStatus;
  wifiStatus: WifiStatus;
  firmwareVersion: string;
  psramMb: number;
  flashMb: number;
  resolution: string;
  streamUrl: string;
  lastSeen: string;
  isDemo: boolean;
  telemetry: Esp32Telemetry;
}

export interface DeviceStatusPayload {
  device_id: string;
  status: string;
  camera: string;
  wifi: string;
  ip: string;
  free_heap: number;
  free_psram: number;
  fps?: number;
  timestamp?: string;
}
