import React from 'react';
import { Video, ScanFace, Maximize2, Radio, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveCameraMini: React.FC = () => {
  const { device, faceState, setActivePage, simulateFaceDetectEvent, settings } = useApp();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Video className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Live Edge Camera Feed
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Node: {device.deviceId} • {device.resolution} • {device.telemetry.fps} FPS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
          <button
            onClick={() => setActivePage('camera')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Expand Full Screen"
            aria-label="Expand Full Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Camera Viewport Canvas */}
      <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80 group">
        {/* Synthetic Video Canvas Feed / Scan lines */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        {/* Ambient Dark Subject Mockup for Demo Viva */}
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <div className="relative flex flex-col items-center justify-center opacity-85">
            {/* Silhouetted Subject Head / Face Target */}
            <div className="relative w-28 h-36 rounded-full border-2 border-slate-700/60 bg-slate-800/50 flex items-center justify-center shadow-inner">
              <ScanFace className="w-12 h-12 text-blue-400/70" />

              {/* Dynamic Simulated Bounding Box */}
              {faceState.faceDetected && (
                <div
                  className="absolute inset-[-10px] border-2 border-emerald-400/90 rounded-lg pointer-events-none animate-pulse"
                  style={{
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {/* Corner Reticles */}
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-300" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-300" />
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-300" />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-300" />

                  {/* Reticle Tag */}
                  <div className="absolute -top-6 left-0 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow">
                    FACE: {(faceState.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            <div className="w-44 h-20 mt-[-10px] rounded-t-3xl bg-slate-800/40 border-t border-slate-700/50" />
          </div>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scanline pointer-events-none" />

        {/* HUD Overlay Info */}
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300/80 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/20 pointer-events-none">
          ESP32-S3 // QVGA RAW 320x240
        </div>

        <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20 pointer-events-none">
          {faceState.faceDetected ? 'STATUS: FACE DETECTED' : 'STATUS: SCANNING'}
        </div>

        {/* Stream badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] font-mono text-amber-300 bg-black/70 px-2 py-0.5 rounded border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400" />
          DEMO STREAM
        </div>

        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded border border-slate-800">
          IP: {device.ipAddress}
        </div>
      </div>

      {/* Card Action footer */}
      <div className="p-3 bg-slate-950/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => simulateFaceDetectEvent(!faceState.faceDetected)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition-colors"
          >
            {faceState.faceDetected ? 'Clear Face' : 'Simulate Face'}
          </button>
        </div>

        <button
          onClick={() => setActivePage('face')}
          className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1 transition-colors"
        >
          Detection Analysis &rarr;
        </button>
      </div>
    </div>
  );
};
