import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  HackathonQueryDto,
  RegisterHackathonDto,
  CreateHackathonDto,
  UpdateHackathonDto,
  ParticipantQueryDto,
  AnnounceDto,
} from './dto/hackathon.dto.js';

@Injectable()
export class HackathonsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ── GET /hackathons ─────────────────────────────────────────
  async findAll(query: HackathonQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.active !== undefined && { isActive: query.active }),
    };

    const [total, data] = await Promise.all([
      this.prisma.hackathon.count({ where }),
      this.prisma.hackathon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          organizer: { select: { id: true, email: true, profile: true } },
          _count: { select: { participants: true } },
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

  // ── GET /hackathons/:id ─────────────────────────────────────
  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, email: true, profile: true } },
        participants: {
          include: {
            user: { select: { id: true, profile: true } },
            team: { select: { id: true, name: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }

    return hackathon;
  }

  // ── POST /hackathons/:id/register ───────────────────────────
  async register(userId: string, hackathonId: string, dto: RegisterHackathonDto) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${hackathonId} not found`);
    }

    if (!hackathon.isActive) {
      throw new BadRequestException('This hackathon is not currently active');
    }

    if (new Date() > hackathon.registrationDeadline) {
      throw new BadRequestException('Registration deadline for this hackathon has passed');
    }

    // Check if user is already registered
    const existing = await this.prisma.hackathonParticipant.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId },
      },
    });

    if (existing) {
      throw new ConflictException('You are already registered for this hackathon');
    }

    // If registering with a team, validate team
    if (dto?.teamId) {
      const team = await this.prisma.team.findUnique({
        where: { id: dto.teamId },
        include: { members: true },
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
      }

      const isMember = team.members.some((m) => m.userId === userId);
      if (!isMember) {
        throw new BadRequestException('You are not a member of this team');
      }

      if (team.members.length > hackathon.maxTeamSize) {
        throw new BadRequestException(
          `Team size (${team.members.length}) exceeds the maximum allowed team size (${hackathon.maxTeamSize}) for this hackathon`,
        );
      }
    }

    return this.prisma.hackathonParticipant.create({
      data: {
        hackathonId,
        userId,
        teamId: dto?.teamId,
      },
      include: {
        hackathon: { select: { id: true, title: true } },
      },
    });
  }

  // ── POST /hackathons (organizer) ───────────────────────────
  async create(organizerId: string, dto: CreateHackathonDto) {
    return this.prisma.hackathon.create({
      data: {
        organizerId,
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        registrationDeadline: new Date(dto.registrationDeadline),
        maxTeamSize: dto.maxTeamSize || 4,
      },
    });
  }

  // ── PATCH /hackathons/:id (owner) ──────────────────────────
  async update(organizerId: string, id: string, dto: UpdateHackathonDto) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      include: { participants: { include: { team: { include: { members: true } } } } },
    });

    if (!hackathon) throw new NotFoundException(`Hackathon with ID ${id} not found`);
    if (hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('Only the hackathon organizer can modify this event');
    }

    if (dto.maxTeamSize !== undefined) {
      const maxExistingTeamSize = Math.max(
        0,
        ...hackathon.participants.map((p) => p.team?.members.length || 0),
      );
      if (dto.maxTeamSize < maxExistingTeamSize) {
        throw new BadRequestException(
          `Cannot lower max team size below existing team size (${maxExistingTeamSize})`,
        );
      }
    }

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.registrationDeadline && { registrationDeadline: new Date(dto.registrationDeadline) }),
        ...(dto.maxTeamSize && { maxTeamSize: dto.maxTeamSize }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // ── GET /organizer/hackathons ──────────────────────────────
  async getOrganizerHackathons(organizerId: string) {
    return this.prisma.hackathon.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participants: true } },
      },
    });
  }

  // ── GET /hackathons/:id/participants ───────────────────────
  async getParticipants(organizerId: string, hackathonId: string, query: ParticipantQueryDto) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    if (hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('Only the hackathon organizer can view participants');
    }

    const where: any = {
      hackathonId,
      ...(query.teamless && { teamId: null }),
    };

    return this.prisma.hackathonParticipant.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, profile: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  // ── GET /hackathons/:id/teams ──────────────────────────────
  async getTeams(organizerId: string, hackathonId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    if (hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('Only the hackathon organizer can view teams');
    }

    return this.prisma.team.findMany({
      where: { hackathonParticipants: { some: { hackathonId } }, deletedAt: null },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true, profile: true } },
          },
        },
      },
    });
  }

  // ── PATCH /hackathons/:id/participants/:userId/check-in ────
  async checkIn(organizerId: string, hackathonId: string, userId: string, checkedIn: boolean) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    if (hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('Only the hackathon organizer can check in participants');
    }

    const participant = await this.prisma.hackathonParticipant.findUnique({
      where: { hackathonId_userId: { hackathonId, userId } },
    });
    if (!participant) throw new NotFoundException('Participant not found');

    return {
      success: true,
      hackathonId,
      userId,
      checkedIn,
    };
  }

  // ── POST /hackathons/:id/announce ──────────────────────────
  async announce(organizerId: string, hackathonId: string, dto: AnnounceDto) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) throw new NotFoundException('Hackathon not found');
    if (hackathon.organizerId !== organizerId) {
      throw new ForbiddenException('Only the hackathon organizer can broadcast announcements');
    }

    return this.notificationsService.broadcastAnnouncement(hackathonId, dto.title, dto.body);
  }
}
