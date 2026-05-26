import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Add notification to the notification center
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      archived: false,
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }, []);

  // Archive a notification (soft delete - sets archived: true)
  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, archived: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Show toast notification (temporary popup)
  const showToast = useCallback((toast) => {
    const newToast = {
      id: Date.now() + Math.random(),
      duration: 4000, // Updated to 4 seconds for optimal UX
      ...toast,
    };
    setToasts((prev) => [...prev, newToast]);

    // Note: Auto-removal is now handled by Toast component with progress bar
  }, []);

  // Remove toast manually
  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Combined function: show toast AND add to notification center
  const notify = useCallback(
    ({ message, type = 'info', title, showInCenter = true, duration = 4000 }) => {
      // Show toast
      showToast({ message, type, title, duration });

      // Add to notification center
      if (showInCenter) {
        addNotification({ message, type, title });
      }
    },
    [showToast, addNotification]
  );

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  const value = {
    notifications,
    toasts,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    showToast,
    removeToast,
    notify,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
