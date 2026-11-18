import { api, ApiResponse } from './api';
import { getEndpoints } from './config';
import type { SecurityLog } from '../types/securityLog';
import { INITIAL_SECURITY_EVENTS } from '../data/demoData';

export class LogService {
  private static STORAGE_KEY = 'nid_security_logs_cache';

  public static async getLogs(filters?: { search?: string; event_type?: string }): Promise<ApiResponse<SecurityLog[]>> {
    const endpoints = getEndpoints();

    return api.get<SecurityLog[]>(endpoints.logs, () => {
      // Demo fallback implementation
      const raw = localStorage.getItem(this.STORAGE_KEY);
      let logs: SecurityLog[] = [];
      if (raw) {
        try {
          logs = JSON.parse(raw);
        } catch {
          logs = this.getInitialDemoLogs();
        }
      } else {
        logs = this.getInitialDemoLogs();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        logs = logs.filter(
          (l) =>
            l.event_type.toLowerCase().includes(q) ||
            l.event_details.toLowerCase().includes(q) ||
            (l.status && l.status.toLowerCase().includes(q))
        );
      }

      return logs;
    });
  }

  public static async addLog(entry: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<SecurityLog> {
    const newLog: SecurityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry,
    };

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const existing: SecurityLog[] = raw ? JSON.parse(raw) : this.getInitialDemoLogs();
      existing.unshift(newLog);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing.slice(0, 200)));
    } catch (e) {
      // ignore
    }

    return newLog;
  }

  private static getInitialDemoLogs(): SecurityLog[] {
    return INITIAL_SECURITY_EVENTS.map((e, index) => ({
      id: e.id || `log-${index}`,
      event_id: `EVT-${1000 + index}`,
      timestamp: e.timestamp,
      event_type: e.event,
      event_details: e.details || `${e.event} on node ${e.device}`,
      severity: e.severity,
      status: e.result === 'SUCCESS' ? 'SUCCESS' : e.result === 'BLOCKED' ? 'BLOCKED' : 'FAILURE',
      user: e.user,
      device: e.device,
      ip_address: e.ipAddress,
    }));
  }
}
