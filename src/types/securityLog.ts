export type SecurityLogSeverity = 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';

export interface SecurityLog {
  id: string | number;
  event_id?: string;
  timestamp: string;
  event_type: string;
  event_details: string;
  severity?: SecurityLogSeverity;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'PENDING' | 'GRANTED' | 'DENIED';
  user?: string;
  device?: string;
  ip_address?: string;
}
