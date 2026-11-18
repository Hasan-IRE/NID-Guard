import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Server, 
  Wifi, 
  ShieldCheck, 
  Lock, 
  Check, 
  RefreshCw,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppSettings } from '../types/settings';

export const Settings: React.FC = () => {
  const { settings, updateSettings, testBackendConnection, addToast } = useApp();

  const [form, setForm] = useState<AppSettings>(settings);
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ checked: boolean; reachable: boolean; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  const handleTestBackend = async () => {
    setTestingBackend(true);
    const result = await testBackendConnection();
    setBackendStatus({ checked: true, reachable: result.reachable, message: result.message });
    setTestingBackend(false);

    addToast({
      title: result.reachable ? 'Backend Reachable' : 'Backend Unreachable',
      message: result.message,
      type: result.reachable ? 'success' : 'warning',
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-400" />
          <span>System Settings & Architecture Parameters</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure IoT network endpoints, Flask API routes, cryptographic policies, and Demo Mode simulation
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: DEMO MODE TOGGLE (Crucial Requirement 17 & 24) */}
        <div className="p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Simulation & Demo Mode Control
                </h3>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Operate entire system with synthetic identity data and edge camera simulation
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.demoModeActive}
                onChange={(e) => setForm({ ...form, demoModeActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-amber-500/20">
            <p>
              • When <strong>ON (Recommended for Viva)</strong>: Uses synthetic demo records, simulates ESP32 status, face detection events, and access logs without needing physical ESP32 hardware connected.
            </p>
            <p>
              • When <strong>OFF (Real Backend Mode)</strong>: Web app attempts direct REST fetch calls to the configured Flask API URL (which routes to the physical ESP32).
            </p>
          </div>
        </div>

        {/* SECTION 2: GENERAL */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
            1. General Identity Platform
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                Application Name
              </label>
              <input
                type="text"
                value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                Research Institution / Lab
              </label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: DEVICE (ESP32-S3) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            2. ESP32-S3 IoT Camera Device Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                ESP32 Local IP Address
              </label>
              <input
                type="text"
                value={form.esp32Ip}
                onChange={(e) => setForm({ ...form, esp32Ip: e.target.value })}
                placeholder="192.168.1.100"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                ESP32 Camera Stream URL
              </label>
              <input
                type="text"
                value={form.esp32StreamUrl}
                onChange={(e) => setForm({ ...form, esp32StreamUrl: e.target.value })}
                placeholder="http://192.168.1.100:81/stream"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: BACKEND (FLASK REST API) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            3. Flask Backend REST API Configuration
          </h3>

          <div>
            <label className="block text-slate-400 text-[11px] uppercase mb-1">
              API Base URL (Flask Server)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.apiBaseUrl}
                onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })}
                placeholder="http://localhost:5000/api"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleTestBackend}
                disabled={testingBackend}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingBackend ? 'animate-spin' : ''}`} />
                Test Ping
              </button>
            </div>
          </div>

          {backendStatus && (
            <div
              className={`p-3 rounded-lg border text-[11px] ${
                backendStatus.reachable
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              {backendStatus.message}
            </div>
          )}
        </div>

        {/* SECTION 5: SECURITY & RBAC */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            4. Access Control & Security Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                Session Timeout (Minutes)
              </label>
              <input
                type="number"
                value={form.sessionTimeoutMinutes}
                onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                Encryption Algorithm (At-Rest)
              </label>
              <select
                value={form.encryptionAlgorithm}
                onChange={(e) => setForm({ ...form, encryptionAlgorithm: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              >
                <option value="AES-256-GCM">AES-256-GCM (Authenticated)</option>
                <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 (Stream)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1">
                Audit Logging Level
              </label>
              <select
                value={form.auditLogLevel}
                onChange={(e) => setForm({ ...form, auditLogLevel: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              >
                <option value="INFO">INFO (Verbose Security Audit)</option>
                <option value="WARNING">WARNING (Anomalies Only)</option>
                <option value="ALERT">ALERT (Intrusions Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply & Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
