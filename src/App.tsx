import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AcademicDisclaimerBanner } from './components/layout/AcademicDisclaimerBanner';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BiometricVerification } from './pages/BiometricVerification';
import { NIDRegistration } from './pages/NIDRegistration';
import { NIDRecords } from './pages/NIDRecords';
import { LiveCamera } from './pages/LiveCamera';
import { SecurityLogs } from './pages/SecurityLogs';
import { Devices } from './pages/Devices';
import { Settings } from './pages/Settings';
import { ArchitectureDocs } from './pages/ArchitectureDocs';
import { Lock, ShieldAlert } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { isAuthenticated, user, hasPermission } = useAuth();
  const { activePage, setActivePage } = useApp();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const getPageTitle = (page: string): string => {
    switch (page) {
      case 'dashboard':
        return 'System Command & Telemetry Console';
      case 'verification':
      case 'access':
        return 'Dual-Biometric Access Verification Gateway';
      case 'registration':
        return 'NID Citizen Registration & Biometric Enrollment';
      case 'camera':
        return 'Live Edge Camera Stream (ESP32-S3)';
      case 'nid':
        return 'National Identity Records Management';
      case 'logs':
        return 'Security Audit & Biometric Access Logs';
      case 'devices':
        return 'IoT Edge Device & Sensor Diagnostics';
      case 'settings':
        return 'System Configuration & Parameters';
      case 'architecture':
        return 'Architecture Reference & Integration Manual';
      default:
        return 'System Dashboard';
    }
  };

  const renderCurrentPage = () => {
    // Role check guards
    if (activePage === 'nid' && !hasPermission('canAccessNidRecords')) {
      return (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 text-center font-mono space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide">
            Access Restricted by Role-Based Access Control (RBAC)
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your current role (<span className="text-cyan-400">{user?.roleLabel}</span>) does not have authorization to view the NID Records registry. Please switch to an Administrator or Security Officer account.
          </p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    if ((activePage === 'verification' || activePage === 'access') && !hasPermission('canAccessControl')) {
      return (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 text-center font-mono space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide">
            Access Control Module Restricted
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your current role (<span className="text-cyan-400">{user?.roleLabel}</span>) does not possess authority to approve access requests.
          </p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    if (activePage === 'logs' && !hasPermission('canAccessSecurityLogs')) {
      return (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 text-center font-mono space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide">
            Security Logs Restricted
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Audit log review is limited to Administrators and Security Officers.
          </p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    if (activePage === 'settings' && !hasPermission('canAccessSettings')) {
      return (
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 text-center font-mono space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wide">
            Administrative Settings Locked
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Only the Administrator can modify network endpoints, Flask API routes, and cryptographic keys.
          </p>
          <button
            onClick={() => setActivePage('dashboard')}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'verification':
      case 'access':
        return <BiometricVerification />;
      case 'registration':
        return <NIDRegistration />;
      case 'nid':
        return <NIDRecords />;
      case 'camera':
        return <LiveCamera />;
      case 'logs':
        return <SecurityLogs />;
      case 'devices':
        return <Devices />;
      case 'settings':
        return <Settings />;
      case 'architecture':
        return <ArchitectureDocs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      {/* Academic Prototype Disclaimer Banner */}
      <AcademicDisclaimerBanner />

      {/* Main Top Header */}
      <Header
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        pageTitle={getPageTitle(activePage)}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar Navigation */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main
          className={`flex-1 transition-all duration-300 min-w-0 p-4 sm:p-6 lg:p-8 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppLayout />
      </AppProvider>
    </AuthProvider>
  );
}
