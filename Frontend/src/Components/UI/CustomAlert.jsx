import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const CustomAlert = () => {
  const { isOpen, message, type, title, confirmText, cancelText, onConfirm, onCancel, variant, inputValue, placeholder } = useAlert();
  const [promptInput, setPromptInput] = useState('');

  useEffect(() => {
    if (isOpen && variant === 'prompt') {
      setPromptInput(inputValue || '');
    }
  }, [isOpen, variant, inputValue]);

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

  const handleConfirm = () => {
    if (variant === 'prompt') {
      onConfirm(promptInput.trim());
    } else {
      onConfirm();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && variant === 'prompt') {
      e.preventDefault();
      if (promptInput.trim()) {
        handleConfirm();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
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
        <div className="px-6 pb-4 text-gray-600">
          <p className="mb-3">{message}</p>
          
          {variant === 'prompt' && (
            <div className="mt-4">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Enter your response...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                autoFocus
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {promptInput.length}/500 characters
                </p>
                {promptInput.trim().length < 10 && (
                  <p className="text-xs text-red-500">
                    Minimum 10 characters required
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          {(variant === 'confirm' || variant === 'prompt') && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {cancelText}
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            disabled={variant === 'prompt' && promptInput.trim().length < 10}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
