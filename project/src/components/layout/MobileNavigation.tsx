import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, Users, ClipboardList, LineChart 
} from 'lucide-react';

const MobileNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around">
        <NavLink
          to="/"
          className={({ isActive }) => `
            flex flex-col items-center py-2 px-3 text-xs font-medium
            ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
          `}
        >
          <LayoutDashboard size={20} className="mb-1" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/jobs"
          className={({ isActive }) => `
            flex flex-col items-center py-2 px-3 text-xs font-medium
            ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
          `}
        >
          <Briefcase size={20} className="mb-1" />
          <span>Jobs</span>
        </NavLink>
        
        <NavLink
          to="/candidates/intake"
          className={({ isActive }) => `
            flex flex-col items-center py-2 px-3 text-xs font-medium
            ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
          `}
        >
          <Users size={20} className="mb-1" />
          <span>Candidates</span>
        </NavLink>
        
        <NavLink
          to="/interview-tasks"
          className={({ isActive }) => `
            flex flex-col items-center py-2 px-3 text-xs font-medium
            ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
          `}
        >
          <ClipboardList size={20} className="mb-1" />
          <span>Tasks</span>
        </NavLink>
        
        <NavLink
          to="/candidate-lifecycle"
          className={({ isActive }) => `
            flex flex-col items-center py-2 px-3 text-xs font-medium
            ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
          `}
        >
          <LineChart size={20} className="mb-1" />
          <span>Lifecycle</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileNavigation;