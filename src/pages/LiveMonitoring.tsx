import React from 'react';
import { LiveCamera } from '../components/camera/LiveCamera';
import { FaceDetectionStatus } from '../components/camera/FaceDetectionStatus';
import { Video, Info, RefreshCw, Shield } from 'lucide-react';
import { useSecureGuardStatus } from '../hooks/useSecureGuardStatus';

export const LiveMonitoring: React.FC = () => {
  const { status, isLiveConnected, lastUpdated, refetch } = useSecureGuardStatus();

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Live OpenCV Video Monitoring & Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming endpoint: Flask <code>/video_feed</code> • Origin: ESP32-S3 OV2640 sensor
          </p>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Frame</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveCamera
            cameraStatus={status?.camera}
            faceDetected={status?.face_detected}
            faceCount={status?.face_count}
            lastUpdated={lastUpdated}
            isLiveConnected={isLiveConnected}
            onRefresh={refetch}
          />
        </div>

        <div>
          <FaceDetectionStatus
            detected={!!status?.face_detected}
            count={status?.face_count || 0}
            engineStatus="OpenCV Haar Cascade"
            lastDetectionTime={status?.timestamp ? String(status.timestamp) : undefined}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold uppercase text-[11px]">
          <Info className="w-4 h-4 text-cyan-400" />
          OpenCV Stream Architectural Note:
        </div>
        <p className="text-[11px] leading-relaxed">
          The video feed is delivered directly from the Flask backend via multipart MJPEG (<code>/video_feed</code>). The ESP32-S3 camera streams raw frames over local Wi-Fi to Flask, where OpenCV decodes each frame, executes Haar-cascade face bounding box localization, and serves the annotated video stream to this dashboard.
        </p>
      </div>
    </div>
  );
};
export default LiveMonitoring;
