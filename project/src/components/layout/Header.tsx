import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  
  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/jobs') return 'Job Management';
    if (path === '/candidates/intake') return 'Candidate Intake';
    if (path === '/candidates/matching') return 'Candidate Matching';
    if (path === '/interview-tasks') return 'Interview Tasks';
    if (path === '/candidate-lifecycle') return 'Candidate Lifecycle';
    if (path === '/performance-review') return 'Performance Review';
    if (path === '/reports') return 'Reports';
    
    return 'RecruitAI';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        </div>
        
        <div className="flex items-center">
          <div className="hidden sm:flex relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            />
          </div>
          
          <button
            type="button"
            className="ml-4 p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full relative"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;