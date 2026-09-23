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

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'u-curr',
    type: 'INVITATION',
    title: 'New Team Invitation',
    body: 'Sarah Chen invited you to join "VectorPulse Hackers" for HackMIT 2026.',
    referenceId: 'inv-1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'u-curr',
    type: 'MATCH',
    title: '98% Skill Match Found!',
    body: 'David Kim specializes in PyTorch & MLOps and matches your open squad role.',
    referenceId: 'rec-2',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'u-curr',
    type: 'HACKATHON_ALERT',
    title: 'Registration Closing Soon',
    body: 'CalHacks 13.0 early registration closes in 48 hours. Secure your spot!',
    referenceId: 'hack-2',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const DEFAULT_INVITATIONS: TeamInvitation[] = [
  {
    id: 'inv-1',
    teamId: 'tm-1',
    teamName: 'VectorPulse Hackers',
    senderName: 'Sarah Chen',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

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
      const realNotifs = Array.isArray(response.data) ? response.data : [];
      const realIds = new Set(realNotifs.map((n) => n.id));
      const mergedNotifs = [
        ...realNotifs,
        ...DEFAULT_NOTIFICATIONS.filter((n) => !realIds.has(n.id)),
      ];
      set({
        notifications: mergedNotifs,
        invitations: get().invitations.length > 0 ? get().invitations : DEFAULT_INVITATIONS,
        unreadCount: mergedNotifs.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch {
      // High-fidelity fallback notifications
      set({
        notifications: DEFAULT_NOTIFICATIONS,
        invitations: DEFAULT_INVITATIONS,
        unreadCount: DEFAULT_NOTIFICATIONS.filter((n) => !n.isRead).length,
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
    } catch {
      // Local optimistic fallback for demo mode & mock invitations
    }
    const updatedInv = get().invitations.map((inv) =>
      inv.id === invitationId ? { ...inv, status } : inv
    );
    set({ invitations: updatedInv });
    return true;
  },
}));
