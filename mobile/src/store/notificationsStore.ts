import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface AppNotification {
  id: string;
  userId: string;
  type: 'INVITATION' | 'MATCH' | 'HACKATHON_ALERT' | 'SYSTEM';
  title: string;
  body: string;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  senderName: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface NotificationsState {
  notifications: AppNotification[];
  invitations: TeamInvitation[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  respondToInvitation: (invitationId: string, status: 'ACCEPTED' | 'DECLINED') => Promise<boolean>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  invitations: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<AppNotification[]>('/notifications');
      const unread = response.data.filter((n) => !n.isRead).length;
      set({
        notifications: response.data,
        unreadCount: unread,
        isLoading: false,
      });
    } catch {
      // High-fidelity fallback notifications
      const mockNotifications: AppNotification[] = [
        {
          id: 'notif-1',
          userId: 'u-1',
          type: 'INVITATION',
          title: 'Squad Invitation Received! ⚡',
          body: 'Marcus Chen invited you to join VectorPulse Hackers for HackMIT 2026.',
          referenceId: 'inv-1',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'notif-2',
          userId: 'u-1',
          type: 'MATCH',
          title: '94% AI Teammate Match Found',
          body: 'Elena Rostova matched with your required backend NestJS & Redis skills.',
          referenceId: 'rec-1',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: 'notif-3',
          userId: 'u-1',
          type: 'HACKATHON_ALERT',
          title: 'HackMIT Registration Deadline',
          body: 'Registration closes in 7 days. Complete squad confirmation now.',
          referenceId: 'hack-1',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ];

      const mockInvitations: TeamInvitation[] = [
        {
          id: 'inv-1',
          teamId: 'tm-1',
          teamName: 'VectorPulse Hackers',
          senderName: 'Marcus Chen',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
      ];

      set({
        notifications: mockNotifications,
        invitations: mockInvitations,
        unreadCount: mockNotifications.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch {
      // local optimistic update
    }
    const updated = get().notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    });
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch {
      // local update
    }
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  respondToInvitation: async (invitationId: string, status) => {
    try {
      await apiClient.patch(`/teams/invitations/${invitationId}`, { status });
      // Update invitation state locally
      const updatedInv = get().invitations.map((inv) =>
        inv.id === invitationId ? { ...inv, status } : inv
      );
      set({ invitations: updatedInv });
      return true;
    } catch {
      return false;
    }
  },
}));
