import React, { useState, useEffect } from 'react';
import { Fingerprint, Database, AlertTriangle, ShieldCheck, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { FingerprintStatus } from '../components/fingerprint/FingerprintStatus';
import { FingerprintTemplates } from '../components/fingerprint/FingerprintTemplates';
import { useSecureGuardStatus } from '../hooks/useSecureGuardStatus';
import { NidService } from '../services/nidService';
import { DemoNidRecord } from '../types/nidRecord';

export const FingerprintManagement: React.FC = () => {
  const { status, refetch } = useSecureGuardStatus();
  const [records, setRecords] = useState<DemoNidRecord[]>([]);

  useEffect(() => {
    NidService.getRecords().then((res) => {
      if (res.data) setRecords(res.data);
    });
  }, []);

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-cyan-400" />
            <span>R307S Fingerprint Sensor & Template Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware biometric verification over ESP32 UART interface
          </p>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Poll Sensor State</span>
        </button>
      </div>

      {/* Live Sensor Metrics */}
      <FingerprintStatus
        connected={!!status?.fingerprint_connected}
        status={status?.fingerprint_status || 'NOT VERIFIED'}
        matchedId={status?.matched_id ?? -1}
        storedTemplates={status?.stored_templates ?? 0}
        accessResult={status?.access_result || 'UNKNOWN'}
      />

      {/* Templates Allocation & Synthetic NID Mapping */}
      <FingerprintTemplates
        storedCount={status?.stored_templates ?? 4}
        matchedId={status?.matched_id ?? -1}
        nidRecords={records}
      />
    </div>
  );
};
export default FingerprintManagement;
