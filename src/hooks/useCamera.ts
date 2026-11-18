import { useState, useCallback } from 'react';
import { getEndpoints } from '../services/config';
import { useApp } from '../context/AppContext';

export function useCamera() {
  const { settings } = useApp();
  const [streamError, setStreamError] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const endpoints = getEndpoints(settings.apiBaseUrl);
  // Live OpenCV MJPEG feed stream from Flask
  const videoFeedUrl = `${endpoints.video}?t=${refreshKey}`;

  const reconnect = useCallback(async () => {
    setIsReconnecting(true);
    setStreamError(false);
    await new Promise((res) => setTimeout(res, 600));
    setRefreshKey((k) => k + 1);
    setIsReconnecting(false);
  }, []);

  const handleStreamError = useCallback(() => {
    setStreamError(true);
  }, []);

  return {
    videoFeedUrl,
    streamError,
    isReconnecting,
    reconnect,
    handleStreamError,
  };
}
