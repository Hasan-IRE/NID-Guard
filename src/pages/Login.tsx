import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User as UserIcon,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export const Login: React.FC = () => {
  const { login, demoLogin } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }
    setLoading(true);

    try {
      await login(username.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid authentication credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    demoLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden cyber-grid">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden relative z-10">
        {/* Academic Prototype Banner */}
        <div className="bg-gradient-to-r from-cyan-950/70 via-slate-950 to-blue-950/70 border-b border-cyan-500/20 px-4 py-2.5 text-center text-xs font-mono">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              IoT Dual-Biometric Security Gateway
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Academic Research Prototype • Isolated Synthetic Evaluation
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-950 border border-cyan-400/30 shadow-xl shadow-cyan-950/50">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight text-white">
                NID SecureGuard
              </h1>
              <p className="text-xs text-cyan-400 font-semibold tracking-wide">
                Secure Identity. Trusted Access.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
              <Cpu className="w-3 h-3 text-cyan-400" />
              ESP32-S3 + OV2640 + R307S Edge Node
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                Admin Username / Email
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Secure Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Role Switcher for Viva Defense */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center">
              Viva Defense 1-Click Role Profiles:
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Administrator</span>
                  <span className="text-[9px] text-cyan-400">Full</span>
                </div>
                <div className="text-[9px] text-slate-400">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('security')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Security Officer</span>
                  <span className="text-[9px] text-blue-400">Audit</span>
                </div>
                <div className="text-[9px] text-slate-400">security / security123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('operator')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Operator</span>
                  <span className="text-[9px] text-amber-400">Enroll</span>
                </div>
                <div className="text-[9px] text-slate-400">operator / operator123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('viewer')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Auditor / Viewer</span>
                  <span className="text-[9px] text-slate-400">Read</span>
                </div>
                <div className="text-[9px] text-slate-400">viewer / viewer123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
