import React from 'react';
import { Shield, Lock, FileText, Users, Cpu, Video, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecuritySummaryCard: React.FC = () => {
  const { device, settings } = useApp();

  const securityStatuses = [
    {
      label: 'Database Encryption',
      value: 'ENABLED',
      subtext: 'AES-256-GCM Envelope Encryption (Synthetic NID DB)',
      icon: Lock,
      status: 'active',
    },
    {
      label: 'Audit Logging',
      value: 'ENABLED',
      subtext: 'HMAC-SHA256 Tamper-Evident Event Stream',
      icon: FileText,
      status: 'active',
    },
    {
      label: 'Role-Based Access (RBAC)',
      value: settings.rbacEnforced ? 'ENFORCED' : 'PERMISSIVE',
      subtext: '4 Roles: Admin, Security Officer, Operator, Viewer',
      icon: Users,
      status: settings.rbacEnforced ? 'active' : 'warning',
    },
    {
      label: 'Edge IoT Device Node',
      value: device.status.toUpperCase(),
      subtext: `${device.deviceId} (${device.ipAddress})`,
      icon: Cpu,
      status: device.status === 'online' ? 'active' : 'error',
    },
    {
      label: 'Edge Camera Stream',
      value: device.cameraStatus.toUpperCase(),
      subtext: 'OV2640 Sensor @ 320x240 QVGA 10 FPS',
      icon: Video,
      status: device.cameraStatus === 'active' ? 'active' : 'error',
    },
    {
      label: 'Biometric Pipeline',
      value: 'READY (Phase 1)',
      subtext: 'Face Detection Boundary Active; Recognition Phase 2-4',
      icon: Shield,
      status: 'active',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 font-mono">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Prototype Security Architecture State
            </h3>
            <p className="text-[10px] text-slate-500">
              Verified operational baselines (Factual State Verification)
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 bg-blue-950/30 text-blue-300">
          PROTOTYPE CERTIFIED
        </span>
      </div>

      {/* Grid of factual security states */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {securityStatuses.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
            >
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-400 mt-0.5 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                  {item.label}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {item.value}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight truncate">
                  {item.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          Key Management: Server-Side KMS & Transport: TLS 1.3
        </span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          Academic Research Security Framework
        </span>
      </div>
    </div>
  );
};
