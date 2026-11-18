import React from 'react';
import { CameraFeed } from '../components/camera/CameraFeed';
import { Video, Shield, Info, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveCamera: React.FC = () => {
  const { device } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            <span>Dedicated Live Camera Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming endpoint: ESP32-S3 OV2640 Sensor & Video Buffer
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Node: <strong className="text-cyan-400">{device.deviceId}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STREAMING
          </span>
        </div>
      </div>

      {/* Main Interactive Camera Feed & Controls Component */}
      <CameraFeed />

      {/* Integration Guide Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold uppercase text-[11px]">
          <Info className="w-4 h-4 text-blue-400" />
          Hardware Deployment & Wi-Fi Camera Note:
        </div>
        <p className="text-[11px] leading-relaxed">
          When connected to physical hardware, the ESP32-S3-WROOM-1 N16R8 runs the Arduino CameraWebServer / ESP-IDF HTTP server on local port 81 (or port 80). The MJPEG stream URL (e.g., <code>http://192.168.1.100:81/stream</code>) transmits continuous QVGA (320x240) JPEG frames over Wi-Fi. In this browser environment, Mode A (Demo Stream) and Local Webcam Mode allow full evaluation without requiring the physical board on the same subnet.
        </p>
      </div>
    </div>
  );
};
