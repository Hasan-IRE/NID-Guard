import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  HardDrive,
  Camera,
  Fingerprint,
  RefreshCw,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Zap,
  Code2,
  Activity,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSecureGuardStatus } from '../hooks/useSecureGuardStatus';
import { DeviceService } from '../services/deviceService';
import { Device } from '../types/device';
import { getEndpoints } from '../services/config';

export const Devices: React.FC = () => {
  const { addToast } = useApp();
  const { status: liveStatus, isLiveConnected, refetch } = useSecureGuardStatus();
  const endpoints = getEndpoints();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pinging, setPinging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pinout' | 'telemetry'>('overview');

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await DeviceService.getDevices();
      if (res.success && res.data) {
        setDevices(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handlePingHardware = async () => {
    setPinging(true);
    try {
      refetch();
      await DeviceService.pingEsp32();
      await loadDevices();
      addToast({
        title: 'Hardware Probed',
        message: 'Polled live edge telemetry from ESP32-S3 and Flask Gateway.',
        type: 'info',
      });
    } catch {
      addToast({
        title: 'Hardware Probe Alert',
        message: 'ESP32-S3 did not acknowledge HTTP ping. Check device Wi-Fi.',
        type: 'warning',
      });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>IoT Edge Hardware Node & Sensor Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status monitoring for ESP32-S3-WROOM-1 N16R8, OV2640 camera, and R307S fingerprint sensor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingHardware}
            disabled={pinging}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
            <span>Probe Edge Nodes</span>
          </button>
        </div>
      </div>

      {/* 3 Hardware Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Node 1: ESP32-S3 OV2640 Camera */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">ESP32-S3 Camera</h3>
                <p className="text-[10px] text-slate-400 font-mono">OV2640 Sensor Array</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              liveStatus?.camera_online
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {liveStatus?.camera_online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-300">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Node IP:</span>
              <span className="font-mono text-cyan-300">{endpoints.base.replace('http://', '').split(':')[0]}:81</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Resolution:</span>
              <span>320 × 240 QVGA</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Frame Rate:</span>
              <span className="text-white font-bold">{liveStatus?.camera_online ? '15 FPS' : '0 FPS (Standby)'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Memory:</span>
              <span>8 MB Octal PSRAM + 16 MB Flash</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Stream Status:</span>
              <span className={liveStatus?.camera_online ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {liveStatus?.camera_online ? 'MJPEG Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Node 2: R307S Fingerprint Sensor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">R307S Fingerprint</h3>
                <p className="text-[10px] text-slate-400 font-mono">Optical UART Module</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              liveStatus?.fingerprint_connected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {liveStatus?.fingerprint_connected ? 'ONLINE' : 'STANDBY'}
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-300">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Hardware Interface:</span>
              <span className="font-mono text-cyan-300">UART 57600 Baud</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Stored Templates:</span>
              <span className="text-white font-bold">{liveStatus?.stored_templates || 5} / 127 Slots</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Verification Time:</span>
              <span>&lt; 0.8 seconds</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Template ID Enforced:</span>
              <span className="text-emerald-400 font-bold">1:1 NID Binding</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Sensor Status:</span>
              <span className="text-cyan-400 font-bold">Armed for Biometrics</span>
            </div>
          </div>
        </div>

        {/* Node 3: Flask Security Gateway */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Security Gateway</h3>
                <p className="text-[10px] text-slate-400 font-mono">Python Flask 3.1 + LBPH</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              GATEWAY ONLINE
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-300">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">API Endpoint:</span>
              <span className="font-mono text-cyan-300">http://127.0.0.1:5000</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Face Recognizer:</span>
              <span className="text-white font-bold">OpenCV Haar + LBPH</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Database Engine:</span>
              <span>SQLite (WAL Journal Mode)</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-400">Security Rule:</span>
              <span className="text-emerald-400 font-bold">Dual-Biometrics Only</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Audit Logging:</span>
              <span className="text-cyan-400 font-bold">Immutable Trail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Hardware Pinout & Wiring Specifications */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Communication Architecture
          </button>
          <button
            onClick={() => setActiveTab('pinout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'pinout' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            ESP32-S3 & R307S Pinout
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-3 text-slate-300 text-xs">
            <h4 className="font-bold text-white text-sm">System Communication Topology:</h4>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-cyan-300 leading-relaxed overflow-x-auto">
              [ESP32-S3 Edge Node] ──(Wi-Fi MJPEG Stream :81)───► [OpenCV LBPH Face Engine]
                     │                                                      │
              [R307S Sensor (UART)]                                         ▼
                     │                                         [Dual-Biometric Verification]
                     └──────(JSON Telemetry /verify/fingerprint)───►        │
                                                                           ▼
                                                                [ACCESS GRANTED / DENIED]
            </div>
            <p className="text-[11px] text-slate-400">
              Zero-Trust Principle: The ESP32-S3 and R307S nodes never grant access autonomously. All biometric vectors and template IDs must be correlated and approved by the centralized Flask REST gateway.
            </p>
          </div>
        )}

        {activeTab === 'pinout' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">R307S to ESP32-S3 Hardware Pinout:</h4>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-rose-400">VCC (Red):</strong> Connect to 3.3V or 5V DC Rail</li>
                <li><strong className="text-slate-400">GND (Black):</strong> Common Ground</li>
                <li><strong className="text-cyan-400">TX (Yellow):</strong> Connect to ESP32-S3 GPIO 17 (RX2)</li>
                <li><strong className="text-cyan-400">RX (Green):</strong> Connect to ESP32-S3 GPIO 18 (TX2)</li>
                <li><strong className="text-amber-400">Touch Out (Blue):</strong> Wakeup / Finger Detection Interrupt</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">OV2640 Camera Interface (ESP32-S3 DVP):</h4>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-white">SIOD / SIOC:</strong> SCCB I2C Control Bus (GPIO 4, 5)</li>
                <li><strong className="text-white">VSYNC / HREF:</strong> Frame Synchronization Clocks</li>
                <li><strong className="text-white">PCLK / XCLK:</strong> Pixel Clock 20MHz</li>
                <li><strong className="text-white">D0 - D7:</strong> 8-bit Parallel Data Bus into Octal PSRAM</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
