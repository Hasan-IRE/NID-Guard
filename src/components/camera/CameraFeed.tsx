import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Radio, 
  RefreshCw, 
  Sliders, 
  Maximize, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Webcam as WebcamIcon,
  Play,
  Square,
  ScanFace
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CameraFeed: React.FC = () => {
  const { device, settings, updateSettings, faceState, setFaceState, addToast } = useApp();
  
  const [streamMode, setStreamMode] = useState<'demo' | 'esp32' | 'webcam'>('demo');
  const [customStreamUrl, setCustomStreamUrl] = useState(settings.esp32StreamUrl || 'http://192.168.1.100:81/stream');
  const [isConnected, setIsConnected] = useState(true);
  const [esp32Error, setEsp32Error] = useState<string | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Handle webcam stream start/stop
  useEffect(() => {
    if (streamMode === 'webcam') {
      navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          addToast({
            title: 'Webcam Access Denied or Unavailable',
            message: err.message || 'Cannot access local webcam.',
            type: 'warning',
          });
          setStreamMode('demo');
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
    }

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [streamMode]);

  const handleConnect = () => {
    setIsConnected(true);
    setEsp32Error(null);
    updateSettings({ esp32StreamUrl: customStreamUrl });
    addToast({
      title: 'Connecting to ESP32 Stream',
      message: `Target endpoint: ${customStreamUrl}`,
      type: 'info',
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    addToast({
      title: 'Stream Disconnected',
      message: 'Camera stream feed terminated.',
      type: 'warning',
    });
  };

  const handleSnapshot = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    setSnapshotTaken(`capture_${timestamp}.jpg`);
    addToast({
      title: 'Snapshot Captured',
      message: `Frame buffer dumped (320x240 RAW JPEG).`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top telemetry status bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Hardware Node</div>
          <div className="text-slate-200 font-semibold truncate">{device.deviceId}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Node Status</div>
          <div className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {device.status.toUpperCase()}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Wi-Fi Network</div>
          <div className="text-slate-200 font-semibold">{device.wifiStatus.toUpperCase()}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">IP Address</div>
          <div className="text-slate-200 truncate">{device.ipAddress}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Camera Sensor</div>
          <div className="text-cyan-400 font-semibold">{device.cameraStatus.toUpperCase()}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Resolution</div>
          <div className="text-slate-200">{device.resolution}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Stream FPS</div>
          <div className="text-emerald-400 font-semibold">{device.telemetry.fps} FPS</div>
        </div>
      </div>

      {/* Main Stream Area */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Stream Canvas */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Scanline & Grid Effect */}
          <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none z-10" />
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-scanline pointer-events-none z-20" />

          {/* Mode Rendering */}
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center font-mono">
              <Square className="w-12 h-12 text-slate-600 mb-2" />
              <div className="text-sm font-semibold text-slate-400">Stream Disconnected</div>
              <div className="text-xs text-slate-600 mt-1">Press "Connect" below to resume live transmission.</div>
            </div>
          ) : streamMode === 'webcam' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Overlay Face Bounding Box over webcam */}
              <div
                className="absolute border-2 border-emerald-400 rounded-lg pointer-events-none z-20 animate-pulse"
                style={{
                  top: '25%',
                  left: '35%',
                  width: '30%',
                  height: '45%',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                }}
              >
                <div className="absolute -top-7 left-0 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-mono px-2 py-0.5 rounded shadow">
                  FACE DETECTED ({(faceState.confidence * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          ) : streamMode === 'esp32' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* Attempt to load real ESP32 MJPEG stream URL */}
              <img
                src={customStreamUrl}
                alt="ESP32-S3 MJPEG Stream"
                className="w-full h-full object-contain"
                onError={() => {
                  setEsp32Error(`Unable to load MJPEG stream from ${customStreamUrl}. Ensure device is powered on same Wi-Fi.`);
                }}
              />
              {esp32Error && (
                <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center font-mono">
                  <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                  <div className="text-sm font-semibold text-slate-200">
                    Physical ESP32 Stream Not Reachable
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
                    {esp32Error}
                  </p>
                  <button
                    onClick={() => setStreamMode('demo')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                  >
                    Switch to Demo Stream Mode
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Mode A: Demo Stream with High-Fidelity Synthetic Reticle */
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
              <div className="relative flex flex-col items-center justify-center opacity-90">
                {/* Silhouette with Face Reticle */}
                <div className="relative w-36 h-44 rounded-full border-2 border-slate-700/80 bg-slate-800/60 flex items-center justify-center shadow-2xl">
                  <ScanFace className="w-16 h-16 text-cyan-400/80" />

                  {/* Bounding Box HUD */}
                  {faceState.faceDetected && (
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

                      <div className="absolute -top-8 left-0 bg-emerald-950/95 border border-emerald-500 text-emerald-300 text-xs font-mono px-2 py-0.5 rounded shadow">
                        PHASE-1 FACE BOUNDARY: {(faceState.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-56 h-28 mt-[-15px] rounded-t-full bg-slate-800/40 border-t border-slate-700/60" />
              </div>
            </div>
          )}

          {/* Crosshair Center Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
            <div className="w-12 h-0.5 bg-cyan-400" />
            <div className="h-12 w-0.5 bg-cyan-400 absolute" />
          </div>

          {/* Top Left Watermark / Mode Indicator */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border shadow ${
              streamMode === 'demo'
                ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                : streamMode === 'webcam'
                ? 'bg-purple-950/80 text-purple-300 border-purple-600/50'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
            }`}>
              {streamMode === 'demo'
                ? 'DEMO STREAM (SIMULATED)'
                : streamMode === 'webcam'
                ? 'LOCAL WEBCAM FEED'
                : 'REAL ESP32 STREAM'}
            </span>
            <span className="hidden sm:inline text-xs font-mono text-cyan-300/80 bg-black/60 px-2 py-1 rounded border border-cyan-500/20">
              OV2640 • 320x240
            </span>
          </div>

          {/* Top Right Live Stamp */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FPS: {device.telemetry.fps}</span>
            </div>
          </div>

          {/* Bottom Left Specs */}
          <div className="absolute bottom-4 left-4 z-20 font-mono text-[11px] text-slate-400 bg-black/70 px-3 py-1.5 rounded-lg border border-slate-800">
            <div>Target: {device.deviceId} ({device.ipAddress})</div>
            <div className="text-slate-500 text-[10px]">Stream Channel: /stream (Port 81)</div>
          </div>
        </div>

        {/* Stream Source Selector bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Stream Source:</span>
            <button
              onClick={() => setStreamMode('demo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                streamMode === 'demo'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mode A: Demo Stream
            </button>
            <button
              onClick={() => setStreamMode('esp32')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                streamMode === 'esp32'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mode B: Real ESP32 URL
            </button>
            <button
              onClick={() => setStreamMode('webcam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                streamMode === 'webcam'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Test with your browser webcam for viva/lab defense"
            >
              <WebcamIcon className="w-3.5 h-3.5" />
              Local Webcam
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSnapshot}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              Capture RAW Frame
            </button>
          </div>
        </div>

        {/* ESP32 Real URL Configuration Controls */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[11px] shrink-0">ESP32 Camera URL:</span>
              <input
                type="text"
                value={customStreamUrl}
                onChange={(e) => setCustomStreamUrl(e.target.value)}
                placeholder="http://192.168.1.100:81/stream"
                className="bg-transparent text-slate-200 font-mono text-xs w-full focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow"
              >
                <Play className="w-3.5 h-3.5" />
                Connect
              </button>
              <button
                onClick={handleDisconnect}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Square className="w-3.5 h-3.5" />
                Disconnect
              </button>
              <button
                onClick={() => {
                  setCustomStreamUrl('http://192.168.1.100:81/stream');
                  handleConnect();
                }}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                title="Reset to default endpoint"
                aria-label="Reset to default endpoint"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
