import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Briefcase, ClipboardList, 
  ActivitySquare, LineChart, Award, FileText
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
      `}
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {text}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-700">RecruitAI</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} text="Dashboard" />
        <NavItem to="/jobs" icon={<Briefcase size={20} />} text="Job Management" />
        <NavItem to="/candidates/intake" icon={<Users size={20} />} text="Candidate Intake" />
        <NavItem to="/candidates/matching" icon={<ActivitySquare size={20} />} text="Matching & Screening" />
        <NavItem to="/interview-tasks" icon={<ClipboardList size={20} />} text="Interview Tasks" />
        <NavItem to="/candidate-lifecycle" icon={<LineChart size={20} />} text="Lifecycle Tracker" />
        <NavItem to="/performance-review" icon={<Award size={20} />} text="Performance Review" />
        <NavItem to="/reports" icon={<FileText size={20} />} text="Reports" />
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            JD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Jeel Doshi</p>
            <p className="text-xs text-gray-500">Recruitment Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;