import React from 'react';
import { useAlert } from '../../context/AlertContext';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const CustomAlert = () => {
  const { isOpen, message, type, title, confirmText, cancelText, onConfirm, onCancel, variant } = useAlert();

  if (!isOpen) return null;

  // Icons based on type
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-10 h-10 text-green-500" />;
      case 'error': return <XCircle className="w-10 h-10 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-10 h-10 text-yellow-500" />;
      default: return <Info className="w-10 h-10 text-blue-500" />;
    }
  };

  // Border color based on type
  const getBorderColor = () => {
     switch (type) {
      case 'success': return 'border-t-4 border-green-500';
      case 'error': return 'border-t-4 border-red-500';
      case 'warning': return 'border-t-4 border-yellow-500';
      default: return 'border-t-4 border-blue-500'; // Brand Primary
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 overflow-hidden ${getBorderColor()}`}
        role="alert"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4">
            <div className="shrink-0">
                {getIcon()}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 text-gray-600">
          <p>{message}</p>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          {variant === 'confirm' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {cancelText}
            </button>
          )}
          
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'error' 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-[#2c9de6] hover:bg-[#205081] focus:ring-blue-500' 
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
