import React from 'react';
import { FaceDetectionHUD } from '../components/face/FaceDetectionHUD';
import { ScanFace, AlertTriangle } from 'lucide-react';

export const FaceDetection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-cyan-400" />
            <span>Face Detection Edge Engine (Phase-1)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Haar Cascade & Neural Network bounding box localization on ESP32-S3
          </p>
        </div>
      </div>

      {/* Main Face HUD Component */}
      <FaceDetectionHUD />
    </div>
  );
};
