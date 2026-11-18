/**
 * Centralized API & Server Configuration for NID SecureGuard
 * Default points to local Flask backend (http://127.0.0.1:5000)
 */

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nid_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiBaseUrl) {
          return parsed.apiBaseUrl.replace(/\/+$/, '');
        }
      } catch (e) {
        // Fallback
      }
    }
  }
  return (import.meta.env?.VITE_API_BASE_URL as string) || 'http://127.0.0.1:5000';
};

export const API_BASE_URL = getApiBaseUrl();

export const getEndpoints = (baseUrl?: string) => {
  const base = (baseUrl || getApiBaseUrl()).replace(/\/+$/, '');
  return {
    base,
    health: `${base}/api/health`,
    status: `${base}/api/system-status`,
    stats: `${base}/api/dashboard/stats`,
    video: `${base}/video_feed`,
    devices: `${base}/api/devices`,
    nid: `${base}/api/nid`,
    faceEnroll: `${base}/api/face/enroll`,
    faceStatus: `${base}/api/face/status`,
    verifyDual: `${base}/api/verify/dual`,
    verifyFingerprint: `${base}/api/verify/fingerprint`,
    logs: `${base}/api/logs`,
    logsExport: `${base}/api/logs/export`,
    esp32Status: `${base}/api/esp32/status`,
  };
};

export const API_ENDPOINTS = getEndpoints();
