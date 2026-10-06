import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  CreateTeamDto,
  JoinTeamDto,
  InviteMemberDto,
  RespondInvitationDto,
  TeamQueryDto,
} from './dto/team.dto.js';
import { InvitationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const QR_TOKEN_TTL = 86400; // 24 hours

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private notifications: NotificationsService,
  ) {}

  // ── POST /teams ─────────────────────────────────────────────
  async create(userId: string, dto: CreateTeamDto) {
    const qrCode = uuidv4();

    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        projectId: dto.projectId,
        maxMembers: dto.maxMembers || 5,
        creatorId: userId,
        qrCode,
        members: {
          create: {
            userId,
            isAdmin: true,
            role: 'Leader',
          },
        },
      },
      include: {
        creator: { select: { id: true, email: true, profile: true } },
        members: {
          include: {
            user: { select: { id: true, email: true, profile: true } },
          },
        },
      },
    });

    // Store QR token in Redis with 24h TTL
    await this.redis.setEx(`qr_join:${qrCode}`, QR_TOKEN_TTL, team.id);

    return team;
  }

  // ── GET /teams ──────────────────────────────────────────────
  async findAll(query: TeamQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.team.count({ where }),
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, email: true, profile: true } },
          _count: { select: { members: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── GET /teams/:id ──────────────────────────────────────────
  async findOne(id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, deletedAt: null },
      include: {
        creator: { select: { id: true, email: true, profile: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
                userSkills: { include: { skill: true } },
              },
            },
          },
        },
        hackathonParticipants: {
          include: { hackathon: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  // ── POST /teams/:id/join ────────────────────────────────────
  async join(userId: string, teamId: string, dto: JoinTeamDto) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, deletedAt: null },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // If QR token is passed, validate from Redis or DB
    if (dto?.qrToken) {
      const redisTeamId = await this.redis.get(`qr_join:${dto.qrToken}`);
      if (redisTeamId !== teamId && team.qrCode !== dto.qrToken) {
        throw new BadRequestException('Invalid or expired QR token');
      }
    }

    // Check membership limits
    if (team.members.length >= team.maxMembers) {
      throw new BadRequestException('Team is already full');
    }

    // Check if already a member
    const isMember = team.members.some((m) => m.userId === userId);
    if (isMember) {
      throw new ConflictException('You are already a member of this team');
    }

    const newMember = await this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        isAdmin: false,
        role: 'Member',
      },
      include: {
        user: { select: { id: true, profile: true } },
      },
    });

    // Notify team creator
    await this.notifications.notify(
      team.creatorId,
      'team_joined',
      'New Team Member Joined',
      `${newMember.user.profile?.displayName || 'A developer'} joined your team ${team.name}`,
      { teamId },
    );

    return newMember;
  }

  // ── POST /teams/:id/invite ──────────────────────────────────
  async invite(teamId: string, inviterId: string, dto: InviteMemberDto) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, deletedAt: null },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check inviter is an admin or creator
    const inviterMember = team.members.find((m) => m.userId === inviterId);
    if (!inviterMember?.isAdmin && team.creatorId !== inviterId) {
      throw new ForbiddenException('Only team admins can invite new members');
    }

    // Check team capacity
    if (team.members.length >= team.maxMembers) {
      throw new BadRequestException('Team is full');
    }

    // Check if invitee is already a member
    if (team.members.some((m) => m.userId === dto.inviteeId)) {
      throw new ConflictException('User is already a member of this team');
    }

    // Check for existing pending invitation
    const existingInvite = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId,
        inviteeId: dto.inviteeId,
        status: InvitationStatus.pending,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new ConflictException('An active invitation is already pending for this user');
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

    const invitation = await this.prisma.teamInvitation.create({
      data: {
        teamId,
        inviterId,
        inviteeId: dto.inviteeId,
        status: InvitationStatus.pending,
        expiresAt,
      },
      include: {
        team: { select: { id: true, name: true } },
      },
    });

    // Send in-app and push notification to invitee
    await this.notifications.notify(
      dto.inviteeId,
      'team_invitation',
      'Team Invitation Received',
      `You were invited to join team ${team.name}!`,
      { teamId, invitationId: invitation.id },
    );

    return invitation;
  }

  // ── PATCH /teams/invitations/:id ────────────────────────────
  async respondInvitation(
    invitationId: string,
    userId: string,
    dto: RespondInvitationDto,
  ) {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation with ID ${invitationId} not found`);
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException('You can only respond to invitations addressed to you');
    }

    if (invitation.status !== InvitationStatus.pending) {
      throw new BadRequestException(`Invitation has already been ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.teamInvitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.expired },
      });
      throw new BadRequestException('Invitation has expired');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.teamInvitation.update({
        where: { id: invitationId },
        data: { status: dto.status },
      });

      if (dto.status === InvitationStatus.accepted) {
        await tx.teamMember.upsert({
          where: {
            teamId_userId: {
              teamId: invitation.teamId,
              userId,
            },
          },
          update: {},
          create: {
            teamId: invitation.teamId,
            userId,
            isAdmin: false,
            role: 'Member',
          },
        });

        // Notify inviter
        await this.notifications.notify(
          invitation.inviterId,
          'invitation_accepted',
          'Invitation Accepted',
          `Your invitation to join team ${invitation.team.name} was accepted!`,
          { teamId: invitation.teamId },
        );
      }

      return updated;
    });
  }

  // ── GET /teams/invitations/me ───────────────────────────────
  async getMyInvitations(userId: string) {
    return this.prisma.teamInvitation.findMany({
      where: {
        inviteeId: userId,
        status: InvitationStatus.pending,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        team: { select: { id: true, name: true, maxMembers: true } },
        inviter: { select: { id: true, email: true, profile: true } },
      },
    });
  }
}
