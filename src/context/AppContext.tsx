import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Device } from '../types/device';
import { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS, INITIAL_DEVICES } from '../data/demoData';
import { DeviceService } from '../services/deviceService';
import { SecurityService } from '../services/securityService';
import { api } from '../services/api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'security' | 'device' | 'face' | 'nid';
  read: boolean;
  severity?: 'info' | 'warning' | 'alert';
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface FaceState {
  isDetecting: boolean;
  faceDetected: boolean;
  faceCount: number;
  lastDetectionTime: string;
  processingStatus: 'READY' | 'ANALYZING' | 'DETECTED' | 'STANDBY';
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
}

interface AppContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  device: Device;
  refreshDeviceStatus: () => Promise<void>;
  faceState: FaceState;
  setFaceState: React.Dispatch<React.SetStateAction<FaceState>>;
  simulateFaceDetectEvent: (detected: boolean) => Promise<void>;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  testBackendConnection: () => Promise<{ reachable: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Security Alert',
    message: 'Unauthorized access attempt detected at Terminal #1 (Unknown Subject).',
    timestamp: '10 mins ago',
    type: 'security',
    read: false,
    severity: 'alert',
  },
  {
    id: 'notif-2',
    title: 'Device Status',
    message: 'ESP32-S3-CAM-001 connected on Wi-Fi (192.168.1.100).',
    timestamp: '25 mins ago',
    type: 'device',
    read: false,
    severity: 'info',
  },
  {
    id: 'notif-3',
    title: 'Face Detection',
    message: 'Face detected by camera sensor. Phase-1 boundary registered.',
    timestamp: '42 mins ago',
    type: 'face',
    read: true,
    severity: 'info',
  },
  {
    id: 'notif-4',
    title: 'NID Access',
    message: 'Demo record NID-DEMO-001 accessed successfully by admin.',
    timestamp: '1 hour ago',
    type: 'nid',
    read: true,
    severity: 'info',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('dashboard');

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nid_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [device, setDevice] = useState<Device>(INITIAL_DEVICES[0]);

  const [faceState, setFaceState] = useState<FaceState>({
    isDetecting: true,
    faceDetected: true,
    faceCount: 1,
    lastDetectionTime: '23:14:32',
    processingStatus: 'READY',
    confidence: 0.96,
    boundingBox: { x: 90, y: 40, width: 140, height: 160 },
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keep api service in sync with demo mode and backend URL
  useEffect(() => {
    api.setBaseUrl(settings.apiBaseUrl);
    api.setDemoMode(settings.demoModeActive);
    localStorage.setItem('nid_settings', JSON.stringify(settings));
  }, [settings]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    addToast({
      title: 'Settings Saved',
      message: 'System parameters updated successfully.',
      type: 'success',
    });
  }, [addToast]);

  const refreshDeviceStatus = useCallback(async () => {
    const res = await DeviceService.getDeviceById(device.id);
    if (res.data) {
      setDevice(res.data);
    }
    addToast({
      title: 'ESP32 Status Refreshed',
      message: `${device.deviceId} is ${device.status.toUpperCase()} (${device.ipAddress})`,
      type: 'info',
    });
  }, [device, addToast]);

  const simulateFaceDetectEvent = useCallback(
    async (detected: boolean) => {
      setFaceState((prev) => ({
        ...prev,
        processingStatus: 'ANALYZING',
      }));

      await new Promise((r) => setTimeout(r, 350));

      const now = new Date().toLocaleTimeString();
      if (detected) {
        setFaceState({
          isDetecting: true,
          faceDetected: true,
          faceCount: 1,
          lastDetectionTime: now,
          processingStatus: 'DETECTED',
          confidence: +(0.93 + Math.random() * 0.05).toFixed(2),
          boundingBox: {
            x: Math.floor(75 + Math.random() * 25),
            y: Math.floor(35 + Math.random() * 20),
            width: 140,
            height: 155,
          },
        });

        await SecurityService.triggerFaceDetect({
          deviceId: device.deviceId,
          faceDetected: true,
          faceCount: 1,
        });

        // Add notification
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: 'Face Detection Event',
          message: `Subject face detected by ${device.deviceId} at ${now}.`,
          timestamp: 'Just now',
          type: 'face',
          read: false,
          severity: 'info',
        };
        setNotifications((prev) => [newNotif, ...prev]);

        addToast({
          title: 'Face Detected',
          message: 'ESP32 camera registered facial bounding boundary (Confidence: 96%).',
          type: 'success',
        });
      } else {
        setFaceState({
          isDetecting: true,
          faceDetected: false,
          faceCount: 0,
          lastDetectionTime: now,
          processingStatus: 'STANDBY',
          confidence: 0,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        });

        addToast({
          title: 'No Face in Frame',
          message: 'Camera sensor reports clear frame.',
          type: 'info',
        });
      }
    },
    [device.deviceId, addToast]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const testBackendConnection = useCallback(async (): Promise<{ reachable: boolean; message: string }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${settings.apiBaseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return { reachable: true, message: `Flask API reachable at ${settings.apiBaseUrl}` };
      }
      return {
        reachable: false,
        message: `Flask returned status HTTP ${res.status}. Check backend endpoint /api/health.`,
      };
    } catch {
      return {
        reachable: false,
        message: `Unable to connect to Flask at ${settings.apiBaseUrl}. Ensure "python app.py" is running on port 5000.`,
      };
    }
  }, [settings.apiBaseUrl]);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        settings,
        updateSettings,
        device,
        refreshDeviceStatus,
        faceState,
        setFaceState,
        simulateFaceDetectEvent,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        testBackendConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
