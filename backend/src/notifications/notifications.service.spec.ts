import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockPrisma: any;
  let mockFirebase: any;

  beforeEach(() => {
    mockPrisma = {
      notification: {
        create: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    mockFirebase = {
      sendToToken: vi.fn().mockResolvedValue(true),
    };

    service = new NotificationsService(mockPrisma, mockFirebase);
  });

  describe('notify', () => {
    it('should create notification in database and trigger FCM push when user has token', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1', title: 'Hello' });
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: 'device-fcm-token' });

      const result = await service.notify('u1', 'team_invite', 'Hello', 'World', { key: 'val' });
      expect(result).toEqual({ id: 'n1', title: 'Hello' });
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(mockFirebase.sendToToken).toHaveBeenCalledWith('device-fcm-token', {
        title: 'Hello',
        body: 'World',
        data: { key: 'val' },
      });
    });

    it('should create notification but not call FCM when user has no token', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });
      mockPrisma.user.findUnique.mockResolvedValue({ fcmToken: null });

      await service.notify('u1', 'system', 'Hi', 'There');
      expect(mockFirebase.sendToToken).not.toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated list and unread count', async () => {
      mockPrisma.notification.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
      mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);

      const result = await service.getUserNotifications('u1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.unreadCount).toBe(2);
      expect(result.meta.total).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);
      await expect(service.markAsRead('u1', 'n999')).rejects.toThrow(NotFoundException);
    });

    it('should update isRead to true', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({ id: 'n1', userId: 'u1' });
      mockPrisma.notification.update.mockResolvedValue({ id: 'n1', isRead: true });

      const result = await service.markAsRead('u1', 'n1');
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.markAllAsRead('u1');
      expect(result).toEqual({ message: 'All notifications marked as read' });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
