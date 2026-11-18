import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Cpu, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Menu,
  Server,
  Lock,
  Clock,
  Fingerprint,
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useSecureGuardStatus } from '../../hooks/useSecureGuardStatus';
import { UserRole } from '../../types/auth';

interface HeaderProps {
  onToggleSidebar?: () => void;
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, pageTitle }) => {
  const { user, logout, demoLogin } = useAuth();
  const { 
    device, 
    settings, 
    updateSettings, 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useApp();

  const { status: liveStatus, isLiveConnected } = useSecureGuardStatus();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }));

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Clock tick every second for real security console feel
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
      case 'security':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'operator':
        return 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50';
      case 'viewer':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const isCameraOnline = liveStatus ? liveStatus.camera === 'ONLINE' : device.status === 'online';
  const isBackendOnline = isLiveConnected || (settings.demoModeActive ? true : false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo with Shield + Biometric / ID card hybrid */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 border border-blue-400/40 shadow-lg shadow-blue-950/50">
              <Shield className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Lock className="w-2 h-2 text-slate-950" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-display">
                  NID SecureGuard
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-cyan-500/30">
                  IoT Biometric
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Secure Identity Access Platform
              </p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-800 mx-2" />

          {/* Current Page Title */}
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wide font-mono">
              / {pageTitle}
            </h1>
          </div>
        </div>

        {/* Center / Right Telemetry: Time, Backend status, Hardware link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Clock display */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{currentDate}</span>
            <span className="font-semibold text-white">{currentTime}</span>
          </div>

          {/* Backend Connection Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-400 text-[10px] uppercase">Flask:</span>
            <span className={`font-semibold text-[11px] ${isBackendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isLiveConnected ? 'CONNECTED' : settings.demoModeActive ? 'DEMO' : 'OFFLINE'}
            </span>
          </div>

          {/* ESP32 Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCameraOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isCameraOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span className="text-slate-400 text-[10px]">ESP32-S3:</span>
            <span className={`font-semibold text-[11px] ${isCameraOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCameraOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Demo Mode Quick Badge Toggle */}
          <button
            onClick={() => updateSettings({ demoModeActive: !settings.demoModeActive })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
              settings.demoModeActive
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Click to toggle Demo Mode vs Live Hardware Backend"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MODE:</span>
            <span>{settings.demoModeActive ? 'DEMO' : 'LIVE FLASK'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700/70 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150 font-mono">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white uppercase tracking-wider">
                      System Notifications
                    </span>
                    {unreadNotificationCount > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-400">
                        {unreadNotificationCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No security notifications present.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-800/40 transition-colors flex items-start gap-3 ${
                          n.read ? 'opacity-70' : 'bg-blue-950/10'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.severity === 'alert' ? (
                            <span className="flex h-5 w-5 rounded-full bg-rose-500/20 text-rose-400 items-center justify-center">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 rounded-full bg-blue-500/20 text-cyan-400 items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-medium text-slate-200">{n.title}</span>
                            <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="User menu"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {user?.fullName || 'User'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {user?.roleLabel || 'Operator'}
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150 font-mono">
                <div className="p-3 border-b border-slate-800 bg-slate-950/60">
                  <div className="text-xs font-semibold text-white">{user?.fullName}</div>
                  <div className="text-[11px] text-slate-400">{user?.department}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Current Role:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${user ? getRoleBadgeColor(user.role) : ''}`}>
                      {user?.roleLabel}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher for Testing/Demo Viva */}
                <div className="p-2 border-b border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400 px-2 py-1">
                    Switch Demo Account:
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button
                      onClick={() => {
                        demoLogin('admin');
                        setShowUserMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded text-left text-xs font-medium transition-colors ${
                        user?.role === 'admin'
                          ? 'bg-purple-950/70 text-purple-300 border border-purple-700/50'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('security');
                        setShowUserMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded text-left text-xs font-medium transition-colors ${
                        user?.role === 'security'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-700/50'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Security
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('operator');
                        setShowUserMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded text-left text-xs font-medium transition-colors ${
                        user?.role === 'operator'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Operator
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('viewer');
                        setShowUserMenu(false);
                      }}
                      className={`px-2 py-1.5 rounded text-left text-xs font-medium transition-colors ${
                        user?.role === 'viewer'
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      Viewer
                    </button>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
