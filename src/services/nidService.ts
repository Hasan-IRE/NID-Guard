import { DemoNidRecord, NidFilterOptions } from '../types/nidRecord';
import { api, ApiResponse } from './api';

export class NidService {
  private static STORAGE_KEY = 'nid_records_db';

  private static normalizeRecord(r: any): DemoNidRecord {
    const nidVal = String(r.nid || r.demo_nid_number || '');
    const fpId = r.fingerprint_id ?? r.fingerprint_template_id ?? null;
    return {
      id: r.id ?? `rec-${Date.now()}`,
      nid: nidVal,
      demo_nid_number: nidVal,
      record_id: r.record_id || `NID-REC-${String(r.id || '001').padStart(3, '0')}`,
      name: r.name || 'Unknown Citizen',
      date_of_birth: r.date_of_birth || '',
      gender: r.gender || 'Other',
      address: r.address || '',
      contact_number: r.contact_number || '',
      blood_group: r.blood_group || 'O+',
      father_name: r.father_name,
      mother_name: r.mother_name,
      fingerprint_id: fpId,
      fingerprint_template_id: fpId,
      face_registered: Boolean(r.face_registered),
      biometric_status: r.biometric_status || (r.face_registered ? 'Registered' : 'Pending Verification'),
      account_status: r.account_status || 'Active',
      created_at: r.created_at || new Date().toISOString(),
      updated_at: r.updated_at || new Date().toISOString(),
      last_access: r.last_access,
      access_count: r.access_count ?? 0,
      encryption_algorithm: 'AES-256-GCM',
      key_version: 'v1.0',
      is_synthetic: true,
    };
  }

  public static async getRecords(filters?: NidFilterOptions): Promise<ApiResponse<DemoNidRecord[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.biometricStatus && filters.biometricStatus !== 'All') {
      params.append('status', filters.biometricStatus);
    }

    const endpoint = `/api/nid${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await api.get<any[]>(endpoint, () => {
      // Local fallback if backend is offline
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    });

    if (res.success && Array.isArray(res.data)) {
      const normalized = res.data.map(this.normalizeRecord);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
      return {
        ...res,
        data: normalized,
      };
    }

    return {
      ...res,
      data: (res.data || []).map(this.normalizeRecord),
    };
  }

  public static async getRecordById(idOrNid: string): Promise<ApiResponse<DemoNidRecord>> {
    const res = await api.get<any>(`/api/nid/${idOrNid}`, () => {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const records: DemoNidRecord[] = JSON.parse(raw);
        const found = records.find((r) => r.nid === idOrNid || String(r.id) === String(idOrNid));
        if (found) return found;
      }
      throw new Error(`Record ${idOrNid} not found`);
    });

    if (res.success && res.data) {
      return {
        ...res,
        data: this.normalizeRecord(res.data),
      };
    }
    return res;
  }

  public static async createRecord(newRecordData: Partial<DemoNidRecord>): Promise<ApiResponse<DemoNidRecord>> {
    const payload = {
      nid: newRecordData.nid || newRecordData.demo_nid_number,
      name: newRecordData.name,
      date_of_birth: newRecordData.date_of_birth,
      gender: newRecordData.gender || 'Other',
      address: newRecordData.address,
      contact_number: newRecordData.contact_number,
      blood_group: newRecordData.blood_group || 'O+',
      fingerprint_id: newRecordData.fingerprint_id ?? newRecordData.fingerprint_template_id,
    };

    const res = await api.post<any>('/api/nid', payload, () => {
      const records = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const newRec = this.normalizeRecord({
        ...newRecordData,
        id: Date.now(),
        created_at: new Date().toISOString(),
      });
      records.unshift(newRec);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
      return newRec;
    });

    return res;
  }

  public static async updateRecord(nid: string, data: Partial<DemoNidRecord>): Promise<ApiResponse<any>> {
    return api.put(`/api/nid/${nid}`, data, () => {
      const records: DemoNidRecord[] = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const idx = records.findIndex((r) => r.nid === nid);
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...data, updated_at: new Date().toISOString() };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
        return { success: true };
      }
      throw new Error('Record not found');
    });
  }

  public static async deleteRecord(nid: string): Promise<ApiResponse<any>> {
    return api.delete(`/api/nid/${nid}`, () => {
      const records: DemoNidRecord[] = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const filtered = records.filter((r) => r.nid !== nid);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return { success: true };
    });
  }

  public static async enrollBiometrics(nid: string, fingerprintId: number): Promise<ApiResponse<any>> {
    return api.post('/api/face/enroll', {
      nid,
      fingerprint_id: fingerprintId,
    });
  }
}
