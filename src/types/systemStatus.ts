export interface SystemStatus {
  camera: string; // e.g. "ONLINE", "OFFLINE"
  camera_online?: boolean;
  fingerprint_connected: boolean;
  fingerprint_status: string; // e.g. "VERIFIED", "NO_FINGER", "WAITING", "DISCONNECTED"
  matched_id: number | null;
  stored_templates: number;
  access_result: string; // e.g. "GRANTED", "DENIED", "WAITING"
  access_reason?: string;
  face_detected: boolean;
  face_count: number;
  face_matched?: boolean;
  matched_nid?: string | null;
  face_distance?: number | null;
  backend: string; // "ONLINE" | "OFFLINE"
  timestamp?: string | number;
  last_access_time?: number | null;
  fps?: number;
  esp32_ip?: string;
}
