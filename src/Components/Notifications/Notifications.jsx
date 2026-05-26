import React, { useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import Navbar from "../Dashboard/NavBar";
import DashboardHeader from "../Dashboard/Header";
import { Trophy, ClipboardEdit, Info, Check, Bell } from "lucide-react";
import Avatar from "../../Assets/avatar.png";
import "../../styles/index.css";

// Icon mapping for notification types
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <Trophy className="w-5 h-5 text-green-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
    case 'warning':
      return <Info className="w-5 h-5 text-orange-600" />;
    case 'error':
      return <ClipboardEdit className="w-5 h-5 text-red-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

// Format timestamp
const formatTimestamp = (date) => {
  const now = new Date();
  const timestamp = new Date(date);
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return timestamp.toLocaleDateString();
};

// Notification Row Component
const NotificationRow = ({ notification, onMarkAsRead, onDelete }) => {
  return (
    <div
      className={`relative border-b border-gray-100 px-6 py-4 transition-all duration-200 group ${
        notification.read
          ? 'bg-white opacity-75 hover:opacity-100'
          : 'bg-blue-50/30 hover:bg-blue-50/50'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Unread Dot Indicator */}
        <div className="flex-shrink-0 mt-1">
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
          {notification.read && (
            <div className="w-2 h-2"></div>
          )}
        </div>

        {/* Icon Badge */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          notification.type === 'success' ? 'bg-green-100' :
          notification.type === 'error' ? 'bg-red-100' :
          notification.type === 'warning' ? 'bg-orange-100' :
          'bg-blue-100'
        }`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 pr-24">
              <h3 className={`text-sm font-semibold mb-1 ${
                notification.read ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.title || 'Notification'}
              </h3>
              <p className={`text-sm ${
                notification.read ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>
            </div>

            {/* Timestamp */}
            <span className="flex-shrink-0 text-xs text-gray-400 mt-0.5">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Actions - Button Group */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-200"
          title="Archive notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

function Notifications() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Filter notifications (exclude archived)
  const filteredNotifications = notifications
    .filter(notif => !notif.archived) // Hide archived notifications
    .filter(notif => {
      if (filter === 'all') return true;
      if (filter === 'quizzes') return notif.type === 'success' || notif.type === 'error';
      if (filter === 'achievements') return notif.type === 'success';
      if (filter === 'system') return notif.type === 'info' || notif.type === 'warning';
      return true;
    });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Side Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <div className="flex-shrink-0 py-4 md:py-6 px-4 md:px-8 bg-gray-100">
          <DashboardHeader
            toggleDropdown={toggleDropdown}
            showDropdown={showDropdown}
            Avatar={Avatar}
          />
        </div>

        {/* Notifications Content */}
        <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {unreadCount} Unread
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Stay updated with your quiz activity
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mt-4">
                {['all', 'quizzes', 'achievements', 'system'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      filter === tab
                        ? 'bg-[#6B7A8F] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-gray-100">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No notifications yet
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    {filter === 'all'
                      ? "You're all caught up! Notifications will appear here when you have new activity."
                      : `No ${filter} notifications to show.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Notifications;
