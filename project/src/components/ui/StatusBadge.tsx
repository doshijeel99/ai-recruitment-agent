import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      applied: { color: 'bg-gray-100 text-gray-800', label: 'Applied' },
      screened: { color: 'bg-blue-100 text-blue-800', label: 'Screened' },
      interview: { color: 'bg-amber-100 text-amber-800', label: 'Interview' },
      offer: { color: 'bg-purple-100 text-purple-800', label: 'Offer' },
      onboarded: { color: 'bg-green-100 text-green-800', label: 'Onboarded' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' },
    };
    
    return statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };
  };
  
  const { color, label } = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;