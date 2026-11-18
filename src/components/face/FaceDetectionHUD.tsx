import React from 'react';
import { ScanFace, CheckCircle2, AlertCircle, Info, Sparkles, Sliders, RefreshCw, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FaceDetectionHUD: React.FC = () => {
  const { device, faceState, simulateFaceDetectEvent, addToast } = useApp();

  return (
    <div className="space-y-6 font-mono">
      {/* Distinction Header Callout per Prompt Instructions */}
      <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-200 uppercase tracking-wide">
              Engineering Architecture Notice: Phase-1 Detection vs Future Recognition
            </h4>
            <div className="mt-1 text-slate-300 space-y-1 text-[11px] leading-relaxed">
              <p>
                <strong className="text-emerald-400">Phase-1 Implementation (Current):</strong> Face Detection Only. The ESP32-S3 edge node and inference engine detect presence of human face boundaries and spatial coordinates.
              </p>
              <p>
                <strong className="text-amber-400">Future Phase 2-4:</strong> Biometric Face Recognition. Deep metric embeddings (FaceNet/MobileFaceNet 128-d / 512-d vector cosine matching) to establish 1:1 identity authentication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Camera Detection Canvas + Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detection Canvas HUD */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs">
            <div className="flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200 uppercase">
                ESP32 Edge Face Inference Viewport
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">FPS: {device.telemetry.fps}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                faceState.faceDetected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {faceState.faceDetected ? 'FACE DETECTED' : 'NO FACE DETECTED'}
              </span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-scanline pointer-events-none z-10" />

            {/* Synthetic Video Feed Subject */}
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
              <div className="relative flex flex-col items-center justify-center opacity-85">
                <div className="relative w-36 h-48 rounded-full border-2 border-slate-700 bg-slate-800/60 flex items-center justify-center">
                  <ScanFace className="w-16 h-16 text-cyan-400/60" />

                  {/* Dynamic Bounding Box Reticle */}
                  {faceState.faceDetected && (
                    <div
                      className="absolute inset-[-14px] border-2 border-emerald-400 rounded-xl pointer-events-none animate-pulse"
                      style={{
                        boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      {/* Corner marks */}
                      <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
                      <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />

                      {/* Tag */}
                      <div className="absolute -top-8 left-0 bg-emerald-950/95 border border-emerald-500 text-emerald-300 text-xs px-2 py-0.5 rounded shadow">
                        FACE #1 • CONFIDENCE: {(faceState.confidence * 100).toFixed(1)}%
                      </div>

                      {/* Coordinates tag */}
                      <div className="absolute -bottom-7 right-0 bg-black/80 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30">
                        x: {faceState.boundingBox.x}, y: {faceState.boundingBox.y}, w: {faceState.boundingBox.width}, h: {faceState.boundingBox.height}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-60 h-28 mt-[-15px] rounded-t-full bg-slate-800/40 border-t border-slate-700/60" />
              </div>
            </div>

            {/* Overlays */}
            <div className="absolute top-3 left-3 text-[10px] text-cyan-300 bg-black/70 px-2 py-1 rounded border border-cyan-500/30">
              OV2640 SENSOR • ESP32-S3 NN INFERENCE
            </div>

            <div className="absolute bottom-3 left-3 text-[10px] text-amber-300 bg-black/70 px-2 py-1 rounded border border-amber-500/30">
              DEMO STREAM • SYNTHETIC INFERENCE
            </div>

            <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-black/70 px-2 py-1 rounded border border-slate-800">
              Last Frame: {faceState.lastDetectionTime}
            </div>
          </div>

          {/* Manual Test Controls Footer */}
          <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Simulate Edge Event:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => simulateFaceDetectEvent(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Simulate Face Detected
              </button>
              <button
                onClick={() => simulateFaceDetectEvent(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                Clear / No Face
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Face Telemetry & Stage Roadmap */}
        <div className="space-y-4">
          {/* Status Metrics Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Inference Metrics
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Detection Status:</span>
                <span className={faceState.faceDetected ? 'text-emerald-400 font-bold' : 'text-slate-400 font-medium'}>
                  {faceState.faceDetected ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Faces Detected:</span>
                <span className="text-slate-200 font-bold font-mono">
                  {faceState.faceCount}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Last Detection:</span>
                <span className="text-cyan-400 font-mono">
                  {faceState.lastDetectionTime}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Processing Engine:</span>
                <span className="text-slate-200 font-mono">
                  {faceState.processingStatus}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Detection Confidence:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {(faceState.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Inference Latency:</span>
                <span className="text-slate-300 font-mono">
                  84 ms (ESP32-S3 NN Vector)
                </span>
              </div>
            </div>
          </div>

          {/* Phase Roadmap Progression Indicator */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 text-xs">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 mb-3">
              Biometric Access Progression
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 p-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1. No Face Detected (Baseline)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>2. Face Detected (Phase-1 Edge Active)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-slate-800/40 text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block shrink-0" />
                <span>3. Face Recognition Processing (Phase-2)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-slate-800/40 text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block shrink-0" />
                <span>4. Identity Matched (Phase-3)</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-slate-800/40 text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block shrink-0" />
                <span>5. Authentication Approved / Denied (Phase-4)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
