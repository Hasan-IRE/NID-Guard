import React from 'react';
import { Fingerprint, CheckCircle2, XCircle, AlertTriangle, Shield, Cpu, Info } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface FingerprintStatusProps {
  connected: boolean;
  status: string;
  matchedId: number;
  storedTemplates: number;
  accessResult: string;
}

export const FingerprintStatus: React.FC<FingerprintStatusProps> = ({
  connected,
  status,
  matchedId,
  storedTemplates,
  accessResult,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider">
              R307S Optical Fingerprint Sensor Live Status
            </h3>
            <p className="text-[10px] text-slate-400">
              Hardware communication via ESP32-S3 UART serial link
            </p>
          </div>
        </div>

        <StatusBadge
          status={connected ? 'CONNECTED' : 'DISCONNECTED'}
          label={connected ? 'SENSOR CONNECTED' : 'SENSOR DISCONNECTED'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Verification Result</span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-bold text-white">{status}</span>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Matched Template ID</span>
          <div className="mt-1 text-base font-bold text-cyan-300">
            {matchedId > 0 ? `#${matchedId}` : 'NONE / UNMATCHED'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Stored Templates (On-Chip)</span>
          <div className="mt-1 text-base font-bold text-purple-300">
            {storedTemplates} Templates
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Access Decision</span>
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-sm font-bold ${accessResult === 'GRANTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {accessResult}
            </span>
            <StatusBadge status={accessResult} />
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1.5 text-slate-300">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5 uppercase text-[10px]">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Hardware Biometric Isolation Guarantee
        </div>
        <p className="text-slate-400 leading-relaxed text-[10px]">
          All mathematical fingerprint templates remain encrypted and stored entirely inside the internal non-volatile memory of the R307S optical sensor. Raw biometric images are never exposed, transmitted over HTTP, or stored in frontend memory.
        </p>
      </div>
    </div>
  );
};
export default FingerprintStatus;
