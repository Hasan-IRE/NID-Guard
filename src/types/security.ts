export type SeverityLevel = 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
export type AccessResult = 'ALLOWED' | 'DENIED';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: SeverityLevel;
  user: string;
  device: string;
  event: string;
  result: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'BLOCKED';
  ipAddress: string;
  metadata?: Record<string, any>;
  details?: string;
}

export interface AccessRequest {
  id: string;
  time?: string;
  timestamp?: string;
  user: string;
  resource: string;
  method: string;
  result: AccessResult;
  reason: string;
  ipAddress: string;
  matchedRecordId?: string;
  matchedId?: number;
  nid?: string;
  faceMatched?: boolean;
  fingerprintMatched?: boolean;
  confidenceScore?: number;
  faceDetected?: boolean;
}

export interface FaceDetectionEvent {
  id: string;
  deviceId: string;
  timestamp: string;
  faceDetected: boolean;
  faceCount: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  status: 'ACTIVE' | 'NO_FACE' | 'PROCESSING' | 'ERROR';
}

export interface SystemStats {
  systemStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  esp32DevicesCount: number;
  esp32OnlineCount: number;
  activeFaceTrackingCount: number;
  recordsCount: number;
  todayAccessRequestsCount: number;
  todayAllowedCount: number;
  todayDeniedCount: number;
  tamperAlertsCount: number;
}
