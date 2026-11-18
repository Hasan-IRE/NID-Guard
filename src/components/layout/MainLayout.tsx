import React, { useState } from 'react';
import { AcademicDisclaimerBanner } from './AcademicDisclaimerBanner';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      <AcademicDisclaimerBanner />

      <Header
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        pageTitle={pageTitle}
      />

      <div className="flex-1 flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main
          className={`flex-1 transition-all duration-300 min-w-0 p-4 sm:p-6 lg:p-8 ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
export default MainLayout;
