import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TeamsService } from './teams.service.js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InvitationStatus } from '@prisma/client';

describe('TeamsService', () => {
  let service: TeamsService;
  let mockPrisma: any;
  let mockRedis: any;
  let mockNotifications: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn((cb) => cb(mockPrisma)),
      team: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      teamMember: {
        create: vi.fn(),
        upsert: vi.fn(),
      },
      teamInvitation: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    mockRedis = {
      setEx: vi.fn().mockResolvedValue('OK'),
      get: vi.fn(),
    };

    mockNotifications = {
      notify: vi.fn().mockResolvedValue({}),
    };

    service = new TeamsService(mockPrisma, mockRedis, mockNotifications);
  });

  describe('create', () => {
    it('should create team with creator as admin and store QR token in Redis with 24h TTL', async () => {
      const mockTeam = { id: 'team-1', name: 'Alpha', qrCode: 'qr-123' };
      mockPrisma.team.create.mockResolvedValue(mockTeam);

      const result = await service.create('user-1', { name: 'Alpha', maxMembers: 5 });
      expect(result).toEqual(mockTeam);
      expect(mockRedis.setEx).toHaveBeenCalledWith(
        expect.stringContaining('qr_join:'),
        86400,
        'team-1',
      );
    });
  });

  describe('join', () => {
    it('should successfully join team with valid QR token', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        name: 'Alpha',
        creatorId: 'creator-1',
        maxMembers: 5,
        members: [],
        qrCode: 'valid-qr',
      });
      mockRedis.get.mockResolvedValue('team-1');
      mockPrisma.teamMember.create.mockResolvedValue({
        id: 'm1',
        teamId: 'team-1',
        userId: 'user-2',
        user: { profile: { displayName: 'Bob' } },
      });

      const result = await service.join('user-2', 'team-1', { qrToken: 'valid-qr' });
      expect(result.id).toBe('m1');
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        'creator-1',
        'team_joined',
        expect.any(String),
        expect.any(String),
        { teamId: 'team-1' },
      );
    });

    it('should return 400 BadRequestException with expired/invalid QR token', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        creatorId: 'creator-1',
        maxMembers: 5,
        members: [],
        qrCode: 'actual-qr',
      });
      mockRedis.get.mockResolvedValue(null);

      await expect(
        service.join('user-2', 'team-1', { qrToken: 'invalid-token' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return 400 BadRequestException when team is full', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        maxMembers: 2,
        members: [{ userId: 'u1' }, { userId: 'u2' }],
      });

      await expect(service.join('user-3', 'team-1', {})).rejects.toThrow(BadRequestException);
    });

    it('should return 409 ConflictException when already a member', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        maxMembers: 5,
        members: [{ userId: 'user-2' }],
      });

      await expect(service.join('user-2', 'team-1', {})).rejects.toThrow(ConflictException);
    });
  });

  describe('invite', () => {
    it('should send FCM notification when admin invites user', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        name: 'Team Rocket',
        creatorId: 'user-1',
        maxMembers: 5,
        members: [{ userId: 'user-1', isAdmin: true }],
      });
      mockPrisma.teamInvitation.findFirst.mockResolvedValue(null);
      mockPrisma.teamInvitation.create.mockResolvedValue({ id: 'inv-1' });

      const result = await service.invite('team-1', 'user-1', { inviteeId: 'user-2' });
      expect(result).toEqual({ id: 'inv-1' });
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        'user-2',
        'team_invitation',
        expect.any(String),
        expect.stringContaining('Team Rocket'),
        expect.any(Object),
      );
    });

    it('should throw 403 ForbiddenException when non-admin invites', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        creatorId: 'creator-1',
        maxMembers: 5,
        members: [{ userId: 'user-regular', isAdmin: false }],
      });

      await expect(
        service.invite('team-1', 'user-regular', { inviteeId: 'user-2' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw 409 ConflictException when invitee is already a member', async () => {
      mockPrisma.team.findFirst.mockResolvedValue({
        id: 'team-1',
        creatorId: 'user-1',
        maxMembers: 5,
        members: [{ userId: 'user-1', isAdmin: true }, { userId: 'user-2' }],
      });

      await expect(
        service.invite('team-1', 'user-1', { inviteeId: 'user-2' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('respondInvitation', () => {
    it('should return 403 ForbiddenException for non-invitee', async () => {
      mockPrisma.teamInvitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        inviteeId: 'correct-invitee',
        status: InvitationStatus.pending,
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        service.respondInvitation('inv-1', 'wrong-user', { status: InvitationStatus.accepted }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should add to TeamMember and notify inviter when accepted', async () => {
      mockPrisma.teamInvitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        teamId: 'team-1',
        inviterId: 'inviter-1',
        inviteeId: 'user-1',
        status: InvitationStatus.pending,
        expiresAt: new Date(Date.now() + 100000),
        team: { id: 'team-1', name: 'Alpha' },
      });
      mockPrisma.teamInvitation.update.mockResolvedValue({
        id: 'inv-1',
        status: InvitationStatus.accepted,
      });

      const result = await service.respondInvitation('inv-1', 'user-1', {
        status: InvitationStatus.accepted,
      });
      expect(result.status).toBe(InvitationStatus.accepted);
      expect(mockPrisma.teamMember.upsert).toHaveBeenCalledWith({
        where: { teamId_userId: { teamId: 'team-1', userId: 'user-1' } },
        update: {},
        create: { teamId: 'team-1', userId: 'user-1', isAdmin: false, role: 'Member' },
      });
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        'inviter-1',
        'invitation_accepted',
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      );
    });

    it('should throw 400 BadRequestException when invitation has expired', async () => {
      mockPrisma.teamInvitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        inviteeId: 'user-1',
        status: InvitationStatus.pending,
        expiresAt: new Date(Date.now() - 1000),
      });
      mockPrisma.teamInvitation.update.mockResolvedValue({});

      await expect(
        service.respondInvitation('inv-1', 'user-1', { status: InvitationStatus.accepted }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
