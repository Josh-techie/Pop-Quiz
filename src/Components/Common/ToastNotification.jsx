import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(toast.duration || 4000);
  const originalDurationRef = useRef(toast.duration || 4000);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getProgressColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200); // Match exit animation duration
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
    const duration = remainingTimeRef.current;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = duration - elapsed;
      // Use original duration for progress calculation to maintain consistency
      const progressPercent = (remaining / originalDurationRef.current) * 100;

      setProgress(Math.max(0, progressPercent));

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleRemove();
      }
    }, 16); // ~60fps
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = remainingTimeRef.current - elapsed;
    }
  };

  const resumeTimer = () => {
    startTimer();
  };

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsPaused(true);
    pauseTimer();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    resumeTimer();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-start gap-3 p-4 rounded-lg border shadow-lg overflow-hidden transition-all duration-300 ${getStyles(
        toast.type
      )} ${
        isExiting
          ? 'opacity-0 transform translate-y-[-20px]'
          : 'opacity-100 transform translate-y-0 animate-toast-enter'
      }`}
      style={{
        animation: isExiting ? 'none' : undefined,
      }}
    >
      {/* Content */}
      <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm mb-1">{toast.title}</p>
        )}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/30">
        <div
          className={`h-full transition-all ${getProgressColor(toast.type)} ${
            isPaused ? '' : 'ease-linear'
          }`}
          style={{
            width: `${progress}%`,
            transition: isPaused ? 'none' : 'width 16ms linear',
          }}
        />
      </div>
    </div>
  );
};

const ToastNotification = () => {
  const { toasts, removeToast } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastNotification;
