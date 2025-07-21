import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-info" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-success/20 bg-success/5';
      case 'error':
        return 'border-error/20 bg-error/5';
      case 'warning':
        return 'border-warning/20 bg-warning/5';
      case 'info':
        return 'border-info/20 bg-info/5';
      default:
        return 'border-info/20 bg-info/5';
    }
  };

  return (
    <div
      className={`
        toast toast-end transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`alert border ${getBorderColor()} shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className="font-semibold text-base-content">{title}</h3>
            {message && (
              <p className="text-sm text-base-content/70 mt-1">{message}</p>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(id), 300);
            }}
            className="btn btn-ghost btn-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Manager
interface ToastManagerProps {
  children: React.ReactNode;
}

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose addToast globally
  React.useEffect(() => {
    (window as any).showToast = addToast;
    return () => {
      delete (window as any).showToast;
    };
  }, []);

  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </>
  );
};

// Toast Hook
export const useToast = () => {
  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(toast);
    }
  };

  const showSuccess = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default Toast; 