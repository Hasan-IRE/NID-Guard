import { SecurityEvent, AccessRequest, SeverityLevel, FaceDetectionEvent } from '../types/security';
import { api, ApiResponse } from './api';
import { getEndpoints } from './config';

export interface DualVerifyParams {
  nid: string;
  fingerprint_id?: number;
  simulated_mode?: boolean;
  sim_face_match?: boolean;
}

export interface DualVerifyResponse {
  access_result: 'GRANTED' | 'DENIED';
  reason: string;
  step?: number;
  message?: string;
  step_results?: {
    nid_registered: boolean;
    face_detected: boolean;
    face_matched: boolean;
    face_nid?: string | null;
    fingerprint_matched: boolean;
    fingerprint_nid?: string | null;
    identity_matched: boolean;
  };
  citizen_details?: {
    nid: string;
    name: string;
    date_of_birth: string;
    gender: string;
    address: string;
    contact_number: string;
    blood_group: string;
    fingerprint_id: number;
    account_status: string;
  };
}

export class SecurityService {
  private static STORAGE_KEY = 'nid_access_logs_db';

  public static async getAccessLogs(
    resultFilter?: 'ALL' | 'ALLOWED' | 'DENIED' | 'GRANTED',
    search?: string
  ): Promise<ApiResponse<AccessRequest[]>> {
    const params = new URLSearchParams();
    if (resultFilter && resultFilter !== 'ALL') {
      const filterVal = resultFilter === 'ALLOWED' ? 'GRANTED' : resultFilter;
      params.append('result', filterVal);
    }
    if (search) {
      params.append('search', search);
    }

    const endpoint = `/api/logs${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await api.get<any[]>(endpoint, () => {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    });

    if (res.success && Array.isArray(res.data)) {
      const formatted: AccessRequest[] = res.data.map((item: any) => ({
        id: `acc-${item.id}`,
        time: item.created_at || new Date().toISOString(),
        timestamp: item.created_at || new Date().toISOString(),
        user: item.user_name || (item.nid ? `NID: ${item.nid}` : 'Unknown Subject'),
        resource: 'Biometric Gate - Zone Alpha',
        method: item.fingerprint_id ? `Dual (Face + FP #${item.fingerprint_id})` : 'Face + NID Pipeline',
        result: (item.result === 'GRANTED' || item.result === 'ALLOWED') ? 'ALLOWED' : 'DENIED',
        reason: item.reason || 'Verification check',
        ipAddress: item.ip_address || '127.0.0.1',
        matchedId: item.fingerprint_id ?? undefined,
        nid: item.nid,
        faceMatched: Boolean(item.face_matched),
        fingerprintMatched: Boolean(item.fingerprint_matched),
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formatted));
      return {
        ...res,
        data: formatted,
      };
    }

    return res;
  }

  public static async verifyDualBiometrics(params: DualVerifyParams): Promise<ApiResponse<DualVerifyResponse>> {
    return api.post<DualVerifyResponse>('/api/verify/dual', params);
  }

  public static async simulateAccessRequest(params: {
    user: string;
    targetRecordId?: string;
    method: string;
    forceDenial?: boolean;
    denialReason?: string;
  }): Promise<ApiResponse<any>> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const logs: AccessRequest[] = raw ? JSON.parse(raw) : [];

    const newLog: AccessRequest = {
      id: `sim-${Date.now()}`,
      time: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      user: params.user,
      resource: 'Biometric Gate - Zone Alpha',
      method: params.method,
      result: params.forceDenial ? 'DENIED' : 'ALLOWED',
      reason: params.denialReason || (params.forceDenial ? 'Policy violation' : 'Both biometrics verified'),
      ipAddress: '127.0.0.1',
      faceMatched: !params.forceDenial,
      fingerprintMatched: !params.forceDenial,
    };

    logs.unshift(newLog);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    return { success: true, data: newLog, statusCode: 200 };
  }

  public static async triggerFaceDetect(payload?: any): Promise<ApiResponse<FaceDetectionEvent>> {
    return {
      success: true,
      statusCode: 200,
      data: {
        id: `fd-${Date.now()}`,
        deviceId: payload?.deviceId || 'ESP32-S3-CAM-001',
        timestamp: new Date().toISOString(),
        faceDetected: payload?.faceDetected ?? true,
        faceCount: payload?.faceCount ?? 1,
        confidence: 0.94,
        status: 'ACTIVE',
      },
    };
  }

  public static exportLogsToCsv(): string {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const logs: AccessRequest[] = raw ? JSON.parse(raw) : [];
    const headers = 'ID,Time,User,Resource,Method,Result,Reason,IP\n';
    const rows = logs.map(
      (l) => `"${l.id}","${l.timestamp || l.time}","${l.user}","${l.resource}","${l.method}","${l.result}","${l.reason}","${l.ipAddress}"`
    ).join('\n');
    return headers + rows;
  }

  public static getExportCsvUrl(): string {
    const endpoints = getEndpoints();
    return endpoints.logsExport;
  }

  public static async getSecurityLogs(filter?: {
    severity?: SeverityLevel | 'ALL';
    search?: string;
  }): Promise<ApiResponse<SecurityEvent[]>> {
    const accessLogsRes = await this.getAccessLogs('ALL', filter?.search);
    if (accessLogsRes.success && accessLogsRes.data) {
      const events: SecurityEvent[] = accessLogsRes.data.map((log) => ({
        id: `sec-${log.id}`,
        timestamp: log.timestamp || log.time || new Date().toISOString(),
        severity: log.result === 'ALLOWED' ? 'INFO' : 'WARNING',
        user: log.user,
        device: 'ESP32-S3-CAM-001',
        event: log.result === 'ALLOWED' ? 'Biometric Authentication Succeeded' : 'Biometric Access Attempt Denied',
        result: log.result === 'ALLOWED' ? 'SUCCESS' : 'BLOCKED',
        ipAddress: log.ipAddress,
        details: log.reason,
      }));

      return {
        success: true,
        data: events,
        statusCode: 200,
      };
    }

    return {
      success: true,
      data: [],
      statusCode: 200,
    };
  }
}
