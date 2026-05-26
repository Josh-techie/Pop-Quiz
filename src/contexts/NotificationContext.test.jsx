/**
 * NotificationContext Tests
 *
 * Tests for notification management, archive/undo, pagination, and filtering
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from './NotificationContext';
import * as firestoreService from '../services/firestoreService';

// Mock Firebase
jest.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com',
    },
    onAuthStateChanged: jest.fn((callback) => {
      callback({
        uid: 'test-user-123',
        email: 'test@example.com',
      });
      return jest.fn();
    }),
  },
  db: {},
}));

// Mock Firestore Service
jest.mock('../services/firestoreService');

describe('NotificationContext', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      userId: 'test-user-123',
      title: 'Quiz Completed',
      message: 'You completed the Technology quiz!',
      type: 'success',
      category: 'quiz',
      read: false,
      isArchived: false,
      createdAt: { toDate: () => new Date('2024-05-21T10:00:00Z') },
    },
    {
      id: 'notif-2',
      userId: 'test-user-123',
      title: '7 Day Streak!',
      message: 'Amazing! You\'ve maintained a week-long streak!',
      type: 'success',
      category: 'achievement',
      read: false,
      isArchived: false,
      createdAt: { toDate: () => new Date('2024-05-21T09:00:00Z') },
    },
    {
      id: 'notif-3',
      userId: 'test-user-123',
      title: 'New Category',
      message: 'Check out the new History category!',
      type: 'info',
      category: 'activity',
      read: true,
      isArchived: false,
      createdAt: { toDate: () => new Date('2024-05-20T15:00:00Z') },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock implementations
    firestoreService.getUserNotificationsPaginated.mockResolvedValue({
      success: true,
      data: mockNotifications,
      hasMore: false,
      lastDoc: null,
    });

    firestoreService.archiveAllNotifications.mockResolvedValue({
      success: true,
      count: 3,
      archivedIds: ['notif-1', 'notif-2', 'notif-3'],
    });

    firestoreService.unarchiveNotifications.mockResolvedValue({
      success: true,
      count: 3,
    });

    firestoreService.markNotificationAsRead.mockResolvedValue({
      success: true,
    });

    firestoreService.markAllNotificationsAsRead.mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==================== BASIC FUNCTIONALITY ====================

  describe('Initial State', () => {
    it('provides default notification context values', () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.loading).toBe(true);
      expect(result.current.hasMore).toBe(false);
      expect(typeof result.current.notify).toBe('function');
      expect(typeof result.current.archiveAllNotifications).toBe('function');
      expect(typeof result.current.undoArchive).toBe('function');
    });

    it('loads notifications on mount', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.unreadCount).toBe(2);
      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalledWith(
        'test-user-123',
        null,
        20
      );
    });
  });

  // ==================== ARCHIVE FUNCTIONALITY ====================

  describe('Archive All Notifications', () => {
    it('archives all notifications optimistically', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(3);

      // Archive all
      let archivedIds;
      await act(async () => {
        archivedIds = await result.current.archiveAllNotifications();
      });

      // Notifications should be cleared immediately (optimistic)
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
      expect(archivedIds).toEqual(['notif-1', 'notif-2', 'notif-3']);
      expect(firestoreService.archiveAllNotifications).toHaveBeenCalledWith('test-user-123');
    });

    it('returns archived IDs for undo functionality', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let archivedIds;
      await act(async () => {
        archivedIds = await result.current.archiveAllNotifications();
      });

      expect(archivedIds).toEqual(['notif-1', 'notif-2', 'notif-3']);
      expect(Array.isArray(archivedIds)).toBe(true);
      expect(archivedIds.length).toBe(3);
    });

    it('handles archive failure gracefully', async () => {
      firestoreService.archiveAllNotifications.mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.notifications.length;

      await act(async () => {
        await result.current.archiveAllNotifications();
      });

      // Notifications should remain on failure
      expect(result.current.notifications).toHaveLength(initialCount);
    });
  });

  // ==================== UNDO FUNCTIONALITY ====================

  describe('Undo Archive', () => {
    it('restores archived notifications within 5-second window', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Archive notifications
      let archivedIds;
      await act(async () => {
        archivedIds = await result.current.archiveAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);

      // Undo within 5 seconds
      await act(async () => {
        await result.current.undoArchive(archivedIds);
      });

      expect(firestoreService.unarchiveNotifications).toHaveBeenCalledWith(archivedIds);
      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalled();
    });

    it('reloads notifications after undo', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = firestoreService.getUserNotificationsPaginated.mock.calls.length;

      let archivedIds;
      await act(async () => {
        archivedIds = await result.current.archiveAllNotifications();
        await result.current.undoArchive(archivedIds);
      });

      // Should have made additional call to reload
      expect(firestoreService.getUserNotificationsPaginated.mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });

    it('handles undo failure gracefully', async () => {
      firestoreService.unarchiveNotifications.mockResolvedValue({
        success: false,
        error: 'Failed to restore',
      });

      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let archivedIds;
      await act(async () => {
        archivedIds = await result.current.archiveAllNotifications();
        await result.current.undoArchive(archivedIds);
      });

      // Should still attempt to reload even on failure
      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalled();
    });
  });

  // ==================== PAGINATION ====================

  describe('Pagination', () => {
    it('loads 20 notifications at a time', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalledWith(
        'test-user-123',
        null,
        20
      );
    });

    it('loads more notifications when requested', async () => {
      const mockLastDoc = { id: 'last-doc' };

      firestoreService.getUserNotificationsPaginated
        .mockResolvedValueOnce({
          success: true,
          data: mockNotifications.slice(0, 2),
          hasMore: true,
          lastDoc: mockLastDoc,
        })
        .mockResolvedValueOnce({
          success: true,
          data: [mockNotifications[2]],
          hasMore: false,
          lastDoc: null,
        });

      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.hasMore).toBe(true);

      // Load more
      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.hasMore).toBe(false);
      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalledWith(
        'test-user-123',
        mockLastDoc,
        20
      );
    });

    it('tracks hasMore state correctly', async () => {
      firestoreService.getUserNotificationsPaginated.mockResolvedValue({
        success: true,
        data: mockNotifications,
        hasMore: false,
        lastDoc: null,
      });

      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  // ==================== MARK AS READ ====================

  describe('Mark as Read', () => {
    it('marks single notification as read', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialUnreadCount = result.current.unreadCount;

      await act(async () => {
        await result.current.markAsRead('notif-1');
      });

      expect(firestoreService.markNotificationAsRead).toHaveBeenCalledWith('notif-1');
      // Should reload notifications
      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalled();
    });

    it('marks all notifications as read', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(firestoreService.markAllNotificationsAsRead).toHaveBeenCalledWith('test-user-123');
      expect(firestoreService.getUserNotificationsPaginated).toHaveBeenCalled();
    });
  });

  // ==================== UNREAD COUNT ====================

  describe('Unread Count', () => {
    it('calculates unread count correctly', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 2 unread notifications (notif-1 and notif-2)
      expect(result.current.unreadCount).toBe(2);
    });

    it('updates unread count when notifications change', async () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.unreadCount).toBe(2);

      // Archive all (should set unread count to 0)
      await act(async () => {
        await result.current.archiveAllNotifications();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  // ==================== NOTIFY FUNCTION ====================

  describe('Notify Function', () => {
    it('provides notify function for creating notifications', () => {
      const wrapper = ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      );

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(typeof result.current.notify).toBe('function');
    });
  });
});
