import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="mt-4 text-center">
          <p className="text-gray-800 font-medium">Loading...</p>
          <p className="text-gray-500 text-sm">Please wait while we process your request</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;