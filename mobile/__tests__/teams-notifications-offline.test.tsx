import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useTeamsStore } from '../src/store/teamsStore';
import { useHackathonsStore } from '../src/store/hackathonsStore';
import { useNotificationsStore } from '../src/store/notificationsStore';
import { offlineCacheService } from '../src/services/offlineCache';
import { fcmService } from '../src/services/fcm';
import { OfflineBanner } from '../src/components/offline/OfflineBanner';
import { apiClient } from '../src/api/client';
import { Text } from 'react-native';

jest.mock('../src/api/client', () => {
  return {
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      defaults: { baseURL: 'http://10.0.2.2:3000' },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
    setupApiClientAuth: jest.fn(),
    setApiBaseUrl: jest.fn(),
  };
});

describe('Branch 2: Teams, Hackathons, Notifications & Offline Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    offlineCacheService.setIsOnline(true);
  });

  describe('Teams Store', () => {
    it('fetches teams or falls back gracefully', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      await useTeamsStore.getState().fetchTeams();
      const state = useTeamsStore.getState();
      expect(state.teams.length).toBeGreaterThan(0);
      expect(state.teams[0].name).toContain('VectorPulse Hackers');
    });

    it('creates team and prepends to list', async () => {
      const newTeam = {
        id: 'tm-new',
        name: 'CyberDefenders',
        description: 'Cybersecurity track project',
        maxMembers: 4,
        members: [],
        createdAt: new Date().toISOString(),
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: newTeam });

      const created = await useTeamsStore.getState().createTeam({
        name: 'CyberDefenders',
        description: 'Cybersecurity track project',
        maxMembers: 4,
      });

      expect(created?.name).toBe('CyberDefenders');
      expect(useTeamsStore.getState().teams[0].id).toBe('tm-new');
    });

    it('joins team with QR token', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({});
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [] });

      const res = await useTeamsStore.getState().joinTeamWithQr('tm-1', 'token-123');
      expect(res.success).toBe(true);
    });
  });

  describe('Hackathons Store', () => {
    it('fetches hackathons catalog', async () => {
      await useHackathonsStore.getState().fetchHackathons();
      const state = useHackathonsStore.getState();
      expect(state.hackathons.length).toBeGreaterThan(0);
      expect(state.hackathons[0].title).toBe('HackMIT 2026');
    });

    it('registers for hackathon', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({});
      const res = await useHackathonsStore.getState().registerForHackathon('hack-1', 'tm-1');
      expect(res.success).toBe(true);
    });
  });

  describe('Notifications & Invitations Store', () => {
    it('fetches notifications and computes unread count', async () => {
      await useNotificationsStore.getState().fetchNotifications();
      const state = useNotificationsStore.getState();
      expect(state.notifications.length).toBe(3);
      expect(state.unreadCount).toBe(2);
    });

    it('marks single notification as read', async () => {
      await useNotificationsStore.getState().markAsRead('notif-1');
      const state = useNotificationsStore.getState();
      const notif = state.notifications.find((n) => n.id === 'notif-1');
      expect(notif?.isRead).toBe(true);
      expect(state.unreadCount).toBe(1);
    });

    it('marks all notifications as read', async () => {
      await useNotificationsStore.getState().markAllAsRead();
      const state = useNotificationsStore.getState();
      expect(state.unreadCount).toBe(0);
    });

    it('accepts team invitation', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({});
      const success = await useNotificationsStore.getState().respondToInvitation('inv-1', 'ACCEPTED');
      expect(success).toBe(true);
      const inv = useNotificationsStore.getState().invitations.find((i) => i.id === 'inv-1');
      expect(inv?.status).toBe('ACCEPTED');
    });
  });

  describe('Offline Cache & Banner', () => {
    it('stores and retrieves cached data', () => {
      offlineCacheService.set('user_profile', { id: 'u-1', name: 'Cached User' });
      const cached = offlineCacheService.get<{ id: string; name: string }>('user_profile');
      expect(cached?.name).toBe('Cached User');
    });

    it('toggles online status and notifies subscribers', () => {
      const listener = jest.fn();
      const unsubscribe = offlineCacheService.subscribeToNetworkChanges(listener);

      expect(listener).toHaveBeenCalledWith(true);

      offlineCacheService.setIsOnline(false);
      expect(listener).toHaveBeenCalledWith(false);

      unsubscribe();
    });

    it('renders OfflineBanner when disconnected', () => {
      ReactTestRenderer.act(() => {
        offlineCacheService.setIsOnline(false);
      });

      let testRenderer: any;
      ReactTestRenderer.act(() => {
        testRenderer = ReactTestRenderer.create(<OfflineBanner />);
      });

      const texts = testRenderer.root.findAllByType(Text);
      const offlineNotice = texts.find((t: any) =>
        typeof t.props.children === 'string' &&
        t.props.children.includes('Offline Mode')
      );
      expect(offlineNotice).toBeTruthy();
    });
  });

  describe('FCM Push Notification Service', () => {
    it('registers token with backend API', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({});
      const token = await fcmService.requestPermissionAndRegister();
      expect(token).toBeTruthy();
      expect(apiClient.post).toHaveBeenCalledWith('/users/me/fcm-token', {
        fcmToken: token,
      });
    });

    it('dispatches incoming push notification to handler', () => {
      const handler = jest.fn();
      fcmService.setNotificationHandler(handler);

      fcmService.simulateIncomingNotification({
        title: 'New Team Invitation',
        body: 'You were invited to HackMIT squad',
      });

      expect(handler).toHaveBeenCalledWith({
        title: 'New Team Invitation',
        body: 'You were invited to HackMIT squad',
      });
    });
  });
});
