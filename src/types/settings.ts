export interface AppSettings {
  appName: string;
  projectTitle: string;
  institution: string;
  esp32Ip: string;
  esp32StreamUrl: string;
  esp32StreamPort: number;
  apiBaseUrl: string;
  sessionTimeoutMinutes: number;
  rbacEnforced: boolean;
  auditLogLevel: 'INFO' | 'WARNING' | 'ALERT';
  demoModeActive: boolean;
  autoSimulateTraffic: boolean;
  encryptionAlgorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  cameraFps: number;
}
