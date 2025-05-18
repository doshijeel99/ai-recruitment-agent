import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';
import { useRecruitment } from '../../contexts/RecruitmentContext';
import LoadingOverlay from '../ui/LoadingOverlay';
import Toast from '../ui/Toast';

const Layout: React.FC = () => {
  const { loading, error } = useRecruitment();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Close mobile sidebar when screen size changes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && showMobileSidebar) {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobileSidebar]);

  React.useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          <div className="fixed inset-y-0 left-0 flex flex-col z-50 w-full max-w-xs bg-white transform transition-transform duration-300 ease-in-out">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <Header onMenuClick={toggleMobileSidebar} />
        
        <main className="flex-1 pb-16 pt-6 px-4 sm:px-6 md:px-8">
          {loading && <LoadingOverlay />}
          <Outlet />
        </main>
        
        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Layout;