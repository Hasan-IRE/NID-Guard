import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Square,
  Sparkles,
  Maximize2,
  ScanFace
} from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

interface LiveCameraProps {
  cameraStatus?: string;
  faceDetected?: boolean;
  faceCount?: number;
  lastUpdated?: string;
  isLiveConnected?: boolean;
  onRefresh?: () => void;
}

export const LiveCamera: React.FC<LiveCameraProps> = ({
  cameraStatus = 'ONLINE',
  faceDetected = false,
  faceCount = 0,
  lastUpdated,
  isLiveConnected = false,
  onRefresh,
}) => {
  const { videoFeedUrl, streamError, isReconnecting, reconnect, handleStreamError } = useCamera();
  const { settings, updateSettings, faceState, simulateFaceDetectEvent } = useApp();
  const [streamSource, setStreamSource] = useState<'flask_opencv' | 'demo'>('flask_opencv');
  const [isPaused, setIsPaused] = useState(false);

  const isActuallyOnline = cameraStatus === 'ONLINE' || cameraStatus === 'ACTIVE';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl font-mono text-xs flex flex-col">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>ESP32-S3 Live OpenCV Video Stream</span>
              <StatusBadge status={cameraStatus} />
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Processed through Flask endpoint: <code>/video_feed</code> • Sensor: OV2640 QVGA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh connection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={reconnect}
            disabled={isReconnecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>Reconnect</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Subtle grid and scanning animation */}
        <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none z-10" />
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-scanline pointer-events-none z-20" />

        {/* Stream Rendering Logic */}
        {isPaused ? (
          <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center font-mono">
            <Square className="w-12 h-12 text-slate-600 mb-2" />
            <div className="text-sm font-semibold text-slate-400">Stream Paused</div>
            <div className="text-xs text-slate-600 mt-1">Press "Resume Stream" below to reconnect.</div>
          </div>
        ) : streamSource === 'flask_opencv' && !streamError && (isLiveConnected || !settings.demoModeActive) ? (
          /* Real OpenCV MJPEG Stream from Flask backend (/video_feed) */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={videoFeedUrl}
              alt="Live OpenCV Stream from Flask"
              className="w-full h-full object-contain"
              onError={handleStreamError}
            />
          </div>
        ) : (
          /* Demo Stream / Offline Fallback Mode */
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            {streamError && !settings.demoModeActive ? (
              <div className="p-6 text-center max-w-md z-30 space-y-2">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <div className="font-bold text-slate-200">
                  Flask Video Feed Offline
                </div>
                <p className="text-[11px] text-slate-400">
                  Cannot connect to <code>{videoFeedUrl}</code>. Ensure the Flask server is running with OpenCV camera capture or switch to Demo Stream below.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={reconnect}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                  >
                    Try Reconnect
                  </button>
                  <button
                    onClick={() => setStreamSource('demo')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    View Demo Stream
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center justify-center opacity-90">
                {/* Silhouette with Face Reticle */}
                <div className="relative w-36 h-44 rounded-full border-2 border-slate-700/80 bg-slate-800/60 flex items-center justify-center shadow-2xl">
                  <ScanFace className="w-16 h-16 text-cyan-400/80" />

                  {/* Bounding Box HUD */}
                  {(faceDetected || faceState.faceDetected) && (
                    <div
                      className="absolute inset-[-15px] border-2 border-emerald-400/90 rounded-xl pointer-events-none animate-pulse"
                      style={{
                        boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
                      }}
                    >
                      <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
                      <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />

                      <div className="absolute -top-8 left-0 bg-emerald-950/95 border border-emerald-500 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap">
                        OPENCV FACE: {faceCount || 1} DETECTED
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-56 h-28 mt-[-15px] rounded-t-full bg-slate-800/40 border-t border-slate-700/60" />
              </div>
            )}
          </div>
        )}

        {/* Center Target Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
          <div className="w-12 h-0.5 bg-cyan-400" />
          <div className="h-12 w-0.5 bg-cyan-400 absolute" />
        </div>

        {/* Top-Left Watermark */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border shadow ${
            isLiveConnected && !streamError
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
              : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
          }`}>
            {isLiveConnected && !streamError ? 'LIVE OPENCV STREAM' : 'DEMO/SIMULATED STREAM'}
          </span>
          <span className="text-[10px] text-cyan-300/80 bg-black/60 px-2 py-1 rounded border border-cyan-500/20">
            OV2640 • 320x240 QVGA
          </span>
        </div>

        {/* Top-Right Telemetry */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 border border-slate-800 text-slate-300 text-[10px]">
            <span className={`w-2 h-2 rounded-full ${faceDetected || faceState.faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Faces: {faceCount || (faceState.faceDetected ? 1 : 0)}</span>
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="absolute bottom-4 left-4 z-20 text-[10px] text-slate-400 bg-black/70 px-3 py-1.5 rounded-lg border border-slate-800">
          <div>Flask Endpoint: <code>/video_feed</code></div>
          {lastUpdated && <div className="text-slate-500 text-[9px] mt-0.5">Updated: {lastUpdated}</div>}
        </div>
      </div>

      {/* Stream Controls Footer */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] uppercase">Source:</span>
          <button
            onClick={() => {
              setStreamSource('flask_opencv');
              reconnect();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              streamSource === 'flask_opencv'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Flask OpenCV (/video_feed)
          </button>
          <button
            onClick={() => setStreamSource('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              streamSource === 'demo'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Demo Stream
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          {streamSource === 'demo' && (
            <button
              onClick={() => simulateFaceDetectEvent(!faceState.faceDetected)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 transition-colors"
            >
              Toggle Demo Face Reticle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default LiveCamera;
