import React from 'react';
import { ScanFace, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface FaceDetectionStatusProps {
  detected: boolean;
  count: number;
  engineStatus?: string;
  lastDetectionTime?: string;
}

export const FaceDetectionStatus: React.FC<FaceDetectionStatusProps> = ({
  detected,
  count,
  engineStatus = 'ACTIVE',
  lastDetectionTime,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white uppercase tracking-wider">
            OpenCV Face Detection Status
          </h4>
        </div>
        <StatusBadge status={detected ? 'DETECTED' : 'NOT DETECTED'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Detection State</span>
          <div className={`text-sm font-bold mt-1 ${detected ? 'text-emerald-400' : 'text-slate-400'}`}>
            {detected ? 'FACE DETECTED' : 'NO FACE DETECTED'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Faces in Frame</span>
          <div className="text-sm font-bold text-cyan-400 mt-1">
            {count}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Engine Status</span>
          <div className="text-xs font-semibold text-slate-200 mt-1">
            {engineStatus} (OpenCV Haar/Cascade)
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Latest Detection</span>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            {lastDetectionTime || 'Scanning live frame...'}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-200 text-[11px] leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <span>
          <strong>Detection Boundary Principle:</strong> OpenCV detects facial coordinates for spatial presence verification only. It does not establish identity recognition or claim facial recognition matching.
        </span>
      </div>
    </div>
  );
};
export default FaceDetectionStatus;
