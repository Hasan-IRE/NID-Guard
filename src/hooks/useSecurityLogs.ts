import { useState, useEffect, useCallback } from 'react';
import type { SecurityLog } from '../types/securityLog';
import { LogService } from '../services/logService';

export function useSecurityLogs(filterQuery?: string) {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await LogService.getLogs({ search: filterQuery });
      if (res.success && res.data) {
        setLogs(res.data);
        setError('');
      } else {
        setError(res.error || 'Failed to fetch logs');
      }
    } catch (e: any) {
      setError(e.message || 'Error loading logs');
    } finally {
      setLoading(false);
    }
  }, [filterQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
}
