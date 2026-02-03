import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    title: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    variant: 'alert', // 'alert' | 'confirm' | 'prompt'
    inputValue: '',
    placeholder: '',
  });

  const showAlert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        type: options.type || 'info', // Default to info
        title: options.title || getTitleFromType(options.type || 'info'),
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        variant: 'alert',
        inputValue: '',
        placeholder: '',
        onConfirm: () => {
          closeAlert();
          resolve(true);
        },
        onCancel: () => {
            closeAlert();
            resolve(false);
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
        setAlertState({
          isOpen: true,
          message,
          type: options.type || 'warning', // Confirm usually implies caution
          title: options.title || 'Confirm',
          confirmText: options.confirmText || 'Yes',
          cancelText: options.cancelText || 'No',
          variant: 'confirm',
          inputValue: '',
          placeholder: '',
          onConfirm: () => {
            closeAlert();
            resolve(true);
          },
          onCancel: () => {
            closeAlert();
            resolve(false);
          },
        });
      });
  }, []);

  const showPrompt = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        type: options.type || 'info',
        title: options.title || 'Input Required',
        confirmText: options.confirmText || 'Submit',
        cancelText: options.cancelText || 'Cancel',
        variant: 'prompt',
        inputValue: options.defaultValue || '',
        placeholder: options.placeholder || '',
        onConfirm: (value) => {
          closeAlert();
          resolve(value);
        },
        onCancel: () => {
          closeAlert();
          resolve(null);
        },
      });
    });
  }, []);

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const getTitleFromType = (type) => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  };

  return (
    <AlertContext.Provider value={{ ...alertState, showAlert, showConfirm, showPrompt, closeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
