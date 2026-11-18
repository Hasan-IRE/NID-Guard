import { useEffect, useState, useCallback, useRef } from 'react';
import type { SystemStatus } from '../types/systemStatus';
import { getEndpoints } from '../services/config';
import { useApp } from '../context/AppContext';

export function useSecureGuardStatus() {
  const { settings } = useApp();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const consecutiveFailures = useRef<number>(0);

  const fetchStatus = useCallback(async () => {
    const endpoints = getEndpoints(settings.apiBaseUrl);

    // If demo mode is forced in settings, generate responsive demo status
    if (settings.demoModeActive) {
      const now = new Date().toLocaleTimeString();
      setStatus({
        camera: 'ONLINE',
        fingerprint_connected: true,
        fingerprint_status: 'VERIFIED',
        matched_id: 1,
        stored_templates: 4,
        access_result: 'GRANTED',
        face_detected: true,
        face_count: 1,
        backend: 'ONLINE',
        timestamp: now,
        fps: 10,
        esp32_ip: settings.esp32Ip || '192.168.1.100',
      });
      setIsLiveConnected(false);
      setError('');
      setLoading(false);
      setLastUpdated(now);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(endpoints.status, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SystemStatus = await response.json();
      consecutiveFailures.current = 0;
      setStatus(data);
      setIsLiveConnected(true);
      setError('');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      consecutiveFailures.current += 1;
      setIsLiveConnected(false);

      // In real mode, if Flask is unreachable, reflect actual OFFLINE states accurately
      // without falsely claiming hardware is connected!
      const errorMsg = `Cannot connect to SecureGuard Backend (${endpoints.status}). Check server.`;
      setError(errorMsg);

      setStatus({
        camera: 'OFFLINE',
        fingerprint_connected: false,
        fingerprint_status: 'DISCONNECTED',
        matched_id: -1,
        stored_templates: 0,
        access_result: 'DENIED',
        face_detected: false,
        face_count: 0,
        backend: 'OFFLINE',
        timestamp: new Date().toLocaleTimeString(),
        fps: 0,
        esp32_ip: settings.esp32Ip || 'DISCONNECTED',
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, [settings.apiBaseUrl, settings.demoModeActive, settings.esp32Ip]);

  useEffect(() => {
    let active = true;

    fetchStatus();

    // 2-second polling as specified in prompt section 5
    const interval = setInterval(() => {
      if (active) {
        fetchStatus();
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fetchStatus]);

  return {
    status,
    error,
    loading,
    isLiveConnected,
    lastUpdated,
    refetch: fetchStatus,
  };
}
