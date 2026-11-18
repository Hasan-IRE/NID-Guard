import React from 'react';
import { 
  Camera, 
  Fingerprint, 
  Server, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Radio,
  ScanFace
} from 'lucide-react';
import type { SystemStatus } from '../../types/systemStatus';
import { StatusBadge } from '../common/StatusBadge';

interface HardwareOverviewProps {
  status: SystemStatus | null;
  loading?: boolean;
  isLiveConnected?: boolean;
  onRefresh?: () => void;
}

export const HardwareOverview: React.FC<HardwareOverviewProps> = ({
  status,
  loading = false,
  isLiveConnected = false,
  onRefresh,
}) => {
  const hardwareItems = [
    {
      name: 'ESP32-S3 Camera Module',
      spec: 'OV2640 2MP • 320x240 MJPEG • Wi-Fi 802.11 b/g/n',
      status: status?.camera || 'OFFLINE',
      icon: Camera,
      connected: status?.camera === 'ONLINE' || status?.camera === 'ACTIVE',
    },
    {
      name: 'R307S Fingerprint Optical Sensor',
      spec: 'UART TTL • 500 DPI • Embedded 1:N DSP Matching',
      status: status?.fingerprint_connected ? 'CONNECTED' : 'DISCONNECTED',
      icon: Fingerprint,
      connected: !!status?.fingerprint_connected,
    },
    {
      name: 'OpenCV Face Detection Engine',
      spec: 'Haar Cascade / MobileNet Bounding Box',
      status: status?.face_detected ? 'FACE DETECTED' : 'SCANNING (NO FACE)',
      icon: ScanFace,
      connected: status?.camera === 'ONLINE' || status?.camera === 'ACTIVE',
    },
    {
      name: 'Python Flask Backend & SQLite',
      spec: 'REST API Service • Audit DB • Event Stream',
      status: status?.backend || (isLiveConnected ? 'ONLINE' : 'OFFLINE'),
      icon: Server,
      connected: isLiveConnected || status?.backend === 'ONLINE',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              IoT Hardware Subsystem Overview
            </h3>
            <p className="text-[10px] text-slate-400">
              Live link telemetry across ESP32-S3, R307S optical sensor & Flask server
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh hardware status"
              aria-label="Refresh hardware status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {hardwareItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1">{item.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  {item.spec}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Physical Link:</span>
                <span className={item.connected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {item.connected ? 'OK / SYNCHRONIZED' : 'FAULT / DISCONNECTED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default HardwareOverview;
