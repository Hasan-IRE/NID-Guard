import React, { useState, useEffect } from 'react';
import {
  Users,
  Camera,
  Fingerprint,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Server,
  Cpu,
  UserPlus,
  ArrowRight,
  ExternalLink,
  Clock,
  Radio,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSecureGuardStatus } from '../hooks/useSecureGuardStatus';
import { NidService } from '../services/nidService';
import { SecurityService } from '../services/securityService';
import { DemoNidRecord } from '../types/nidRecord';
import { AccessRequest } from '../types/security';
import { getEndpoints } from '../services/config';

export const Dashboard: React.FC = () => {
  const { setActivePage, addToast } = useApp();
  const { status: liveStatus, isLiveConnected, refetch } = useSecureGuardStatus();
  const endpoints = getEndpoints();

  const [stats, setStats] = useState({
    totalRecords: 5,
    faceCount: 3,
    fpCount: 5,
    grantedCount: 12,
    deniedCount: 4,
  });

  const [recentLogs, setRecentLogs] = useState<AccessRequest[]>([]);
  const [recentCitizens, setRecentCitizens] = useState<DemoNidRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [nidRes, logsRes] = await Promise.all([
        NidService.getRecords(),
        SecurityService.getAccessLogs('ALL'),
      ]);

      if (nidRes.success && nidRes.data) {
        const recs = nidRes.data;
        setRecentCitizens(recs.slice(0, 5));
        const faceEnrolled = recs.filter((r) => r.face_registered).length;
        const fpEnrolled = recs.filter((r) => r.fingerprint_id !== null).length;

        setStats((prev) => ({
          ...prev,
          totalRecords: recs.length,
          faceCount: faceEnrolled,
          fpCount: fpEnrolled,
        }));
      }

      if (logsRes.success && logsRes.data) {
        const logs = logsRes.data;
        setRecentLogs(logs.slice(0, 6));
        const granted = logs.filter((l) => l.result === 'ALLOWED').length;
        const denied = logs.filter((l) => l.result === 'DENIED').length;

        setStats((prev) => ({
          ...prev,
          grantedCount: granted,
          deniedCount: denied,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    refetch();
    loadDashboardData();
    addToast({
      title: 'Dashboard Updated',
      message: 'Synchronized telemetry with Flask backend and SQLite database.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span>Security Command & Biometric Operations Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric monitoring across ESP32-S3 camera, R307S optical sensor & Flask API
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActivePage('verification')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Biometrics</span>
          </button>

          <button
            onClick={() => setActivePage('registration')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-cyan-400" />
            <span>Register NID</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Primary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Registered NIDs</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-display">{stats.totalRecords}</div>
          <div className="text-[10px] text-slate-400">Total citizen records</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Face Enrolled</span>
            <Camera className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-display">{stats.faceCount}</div>
          <div className="text-[10px] text-emerald-400">LBPH trained models</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Fingerprint Enrolled</span>
            <Fingerprint className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-display">{stats.fpCount}</div>
          <div className="text-[10px] text-cyan-400">R307S flash templates</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Access Granted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-display">{stats.grantedCount}</div>
          <div className="text-[10px] text-slate-400">Dual biometrics verified</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Access Denied</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-display">{stats.deniedCount}</div>
          <div className="text-[10px] text-rose-400/80">Security denials blocked</div>
        </div>
      </div>

      {/* 3 Hardware & Core Node Telemetry Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Node 1: ESP32-S3 Camera */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>ESP32-S3 OV2640 Camera</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              liveStatus?.camera_online ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {liveStatus?.camera_online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="space-y-1 text-slate-400 text-[10px]">
            <div className="flex justify-between">
              <span>Stream Target:</span>
              <span className="text-white font-mono">172.16.115.131:81/stream</span>
            </div>
            <div className="flex justify-between">
              <span>Face Reticle:</span>
              <span className="text-cyan-300">{liveStatus?.face_detected ? 'FACE DETECTED' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        {/* Node 2: R307S Fingerprint Sensor */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>R307S Fingerprint Sensor</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              liveStatus?.fingerprint_connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {liveStatus?.fingerprint_connected ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>
          <div className="space-y-1 text-slate-400 text-[10px]">
            <div className="flex justify-between">
              <span>Flash Templates:</span>
              <span className="text-white font-mono">{liveStatus?.stored_templates || 5} / 127 Slots</span>
            </div>
            <div className="flex justify-between">
              <span>Hardware Link:</span>
              <span className="text-cyan-300">UART 57600 baud</span>
            </div>
          </div>
        </div>

        {/* Node 3: Flask Backend Gateway */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Flask REST API Gateway</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ONLINE
            </span>
          </div>
          <div className="space-y-1 text-slate-400 text-[10px]">
            <div className="flex justify-between">
              <span>Database Engine:</span>
              <span className="text-white font-mono">SQLite (WAL Mode)</span>
            </div>
            <div className="flex justify-between">
              <span>Security Rule:</span>
              <span className="text-emerald-400">Strict Dual-Biometric</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Live Video Feed Preview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Camera Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Live Biometric Video Feed</span>
            </div>
            <button
              onClick={() => setActivePage('camera')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg">
            <img
              src={endpoints.video}
              alt="Live Camera Feed"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[9px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-black/60 text-cyan-400 border border-cyan-500/30">
                  ESP32-S3 MJPEG STREAM
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 text-slate-400">
                  {liveStatus?.camera_online ? 'ACTIVE' : 'STANDBY RETICLE'}
                </span>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setActivePage('verification')}
                  className="pointer-events-auto px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-[10px] shadow backdrop-blur-sm"
                >
                  Open Verification Portal
                </button>
              </div>
              <div className="text-[9px] text-slate-400 bg-black/60 px-2 py-0.5 rounded self-start">
                OpenCV LBPH Face Recognizer
              </div>
            </div>
          </div>
        </div>

        {/* Recent Access Activity (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Recent Biometric Access Attempts</span>
            </div>
            <button
              onClick={() => setActivePage('logs')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[9px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Biometrics</th>
                    <th className="py-2.5 px-3">Decision</th>
                    <th className="py-2.5 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">
                        No recent access activity logged yet.
                      </td>
                    </tr>
                  ) : (
                    recentLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400 text-[10px] whitespace-nowrap">
                          {l.timestamp ? l.timestamp.substring(11, 19) : l.time ? l.time.substring(11, 19) : 'Recent'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-white truncate max-w-[120px]">
                          {l.user}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[10px]">
                          <span className={l.faceMatched ? 'text-emerald-400' : 'text-slate-500'}>Face</span>
                          {' + '}
                          <span className={l.fingerprintMatched ? 'text-emerald-400' : 'text-slate-500'}>FP</span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            l.result === 'ALLOWED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {l.result === 'ALLOWED' ? 'GRANTED' : 'DENIED'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[10px] text-slate-400 truncate max-w-[130px]">
                          {l.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
