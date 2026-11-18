import React from 'react';
import { ShieldCheck, Lock, Activity, Server, FileText, Cpu } from 'lucide-react';
import type { SystemStatus } from '../../types/systemStatus';

interface SystemHealthProps {
  status: SystemStatus | null;
  isLiveConnected?: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ status, isLiveConnected }) => {
  const healthMetrics = [
    {
      label: 'Zero-Trust Pipeline',
      status: isLiveConnected ? 'ACTIVE' : 'STANDBY',
      subtext: 'UART R307S Fingerprint + OpenCV Face Localization',
      icon: ShieldCheck,
    },
    {
      label: 'Database Encryption',
      status: 'ENABLED',
      subtext: 'AES-256-GCM Envelope Encryption on Demo NID records',
      icon: Lock,
    },
    {
      label: 'Audit Log Integrity',
      status: 'TAMPER-EVIDENT',
      subtext: 'SQLite Append-Only Ledger with duplicate check',
      icon: FileText,
    },
    {
      label: 'ESP32 Wi-Fi Node',
      status: status?.camera === 'ONLINE' ? 'SYNCHRONIZED' : 'OFFLINE',
      subtext: status?.esp32_ip ? `Endpoint: ${status.esp32_ip}` : 'Waiting for telemetry',
      icon: Cpu,
    },
    {
      label: 'OpenCV Stream',
      status: status?.camera === 'ONLINE' ? 'PROCESSING' : 'IDLE',
      subtext: status?.face_detected ? `${status.face_count} face(s) in frame` : 'Zero faces detected',
      icon: Activity,
    },
    {
      label: 'Flask REST Service',
      status: status?.backend || (isLiveConnected ? 'ONLINE' : 'OFFLINE'),
      subtext: 'Port 5000 CORS API gateway',
      icon: Server,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <h3 className="font-bold text-white uppercase tracking-wider">
            Operational Security State Verification
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Factual system guarantees without numerical score inflation
          </p>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 uppercase font-bold">
          {isLiveConnected ? 'LIVE HARDWARE LINK' : 'DEMO/OFFLINE FALLBACK'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {healthMetrics.map((item, idx) => {
          const Icon = item.icon;
          const isOk = item.status === 'ENABLED' || item.status === 'ACTIVE' || item.status === 'SYNCHRONIZED' || item.status === 'ONLINE' || item.status === 'PROCESSING' || item.status === 'TAMPER-EVIDENT';
          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
            >
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-400 mt-0.5 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                  {item.label}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-bold tracking-tight ${isOk ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight truncate">
                  {item.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SystemHealth;
