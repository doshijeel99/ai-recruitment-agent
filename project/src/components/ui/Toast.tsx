import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const icon = type === 'success' ? <CheckCircle className="text-green-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center max-w-sm w-full">
      <div className={`${bgColor} ${borderColor} border-l-4 p-4 rounded-md shadow-md flex items-center w-full`}>
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            type="button"
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;