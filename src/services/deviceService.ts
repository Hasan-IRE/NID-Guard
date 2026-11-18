import { Device } from '../types/device';
import { api, ApiResponse } from './api';
import { INITIAL_DEVICES } from '../data/demoData';

export class DeviceService {
  private static STORAGE_KEY = 'nid_devices_list';

  public static async getDevices(): Promise<ApiResponse<Device[]>> {
    const res = await api.get<any[]>('/api/devices', () => {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return INITIAL_DEVICES;
    });

    if (res.success && Array.isArray(res.data)) {
      const mapped: Device[] = res.data.map((d: any) => ({
        id: d.id,
        deviceId: d.id === 'dev-001' ? 'ESP32-S3-CAM-001' : d.id === 'dev-002' ? 'R307S-FP-002' : 'FLASK-GW-003',
        name: d.name,
        type: d.type,
        location: d.id === 'dev-001' ? 'Biometric Entrance Reticle' : d.id === 'dev-002' ? 'Physical UART Keypad' : 'Central Processing Unit',
        ipAddress: d.ip_address,
        macAddress: '34:85:18:9B:4C:E2',
        status: d.status === 'online' ? 'online' : 'offline',
        cameraStatus: d.id === 'dev-001' ? (d.status === 'online' ? 'active' : 'inactive') : 'inactive',
        wifiStatus: 'connected',
        firmwareVersion: 'v2.4-SecureGuard',
        psramMb: 8,
        flashMb: 16,
        resolution: d.telemetry?.resolution || '320 × 240',
        streamUrl: d.stream_url,
        lastSeen: d.last_communication || 'Just now',
        isDemo: false,
        telemetry: {
          freeHeapBytes: 184512,
          totalHeapBytes: 327680,
          freePsramBytes: 7421952,
          totalPsramBytes: 8388608,
          cpuFreqMhz: 240,
          temperatureCelsius: 41.2,
          wifiRssiDbm: -56,
          fps: d.telemetry?.fps || 15,
          uptimeSeconds: 15400,
        },
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mapped));
      return {
        ...res,
        data: mapped,
      };
    }

    return res;
  }

  public static async getDeviceById(id: string): Promise<ApiResponse<Device>> {
    const res = await this.getDevices();
    if (res.success && res.data) {
      const found = res.data.find((d) => d.id === id || d.deviceId === id);
      if (found) {
        return { success: true, data: found, statusCode: 200 };
      }
    }
    return { success: false, error: 'Device not found', statusCode: 404 };
  }

  public static async pingEsp32(): Promise<ApiResponse<any>> {
    return api.get('/api/esp32/status');
  }
}
