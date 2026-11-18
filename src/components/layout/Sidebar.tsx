import React from 'react';
import {
  LayoutDashboard,
  Video,
  ScanFace,
  CreditCard,
  KeyRound,
  ShieldAlert,
  Cpu,
  SlidersHorizontal,
  BookOpen,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: 'canAccessCamera' | 'canAccessFaceDetection' | 'canAccessFingerprint' | 'canAccessNidRecords' | 'canAccessControl' | 'canAccessSecurityLogs' | 'canManageDevices' | 'canAccessSettings';
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { hasPermission, user } = useAuth();
  const { activePage, setActivePage, addToast } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'verification', label: 'Biometric Verification', icon: KeyRound, permission: 'canAccessControl', badge: 'Core', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'registration', label: 'NID Registration', icon: UserPlus, permission: 'canAccessNidRecords', badge: 'Wizard', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'nid', label: 'NID Records', icon: CreditCard, permission: 'canAccessNidRecords' },
    { id: 'camera', label: 'Live Camera Stream', icon: Video, permission: 'canAccessCamera' },
    { id: 'logs', label: 'Access & Audit Logs', icon: ShieldAlert, permission: 'canAccessSecurityLogs' },
    { id: 'devices', label: 'Device Management', icon: Cpu, permission: 'canManageDevices' },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal, permission: 'canAccessSettings' },
    { id: 'architecture', label: 'Architecture & Docs', icon: BookOpen, badge: 'Manual', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.permission && !hasPermission(item.permission)) {
      addToast({
        title: 'Access Restricted by RBAC',
        message: `Your current role (${user?.roleLabel || 'Viewer'}) does not have permission to access ${item.label}.`,
        type: 'warning',
      });
      return;
    }
    setActivePage(item.id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className={`px-3 py-1 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 ${
            collapsed ? 'hidden' : 'block'
          }`}>
            Navigation Module
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isAllowed = !item.permission || hasPermission(item.permission);
            const isActive = activePage === item.id || (item.id === 'verification' && activePage === 'access');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold shadow-md shadow-cyan-950/20'
                    : isAllowed
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    : 'text-slate-600 opacity-60 cursor-not-allowed'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1.5 ml-2">
                      {!isAllowed && <Lock className="w-3 h-3 text-slate-500" />}
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Toggle */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 hidden lg:block">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
