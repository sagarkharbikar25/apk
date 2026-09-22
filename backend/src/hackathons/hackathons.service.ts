import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { HackathonQueryDto, RegisterHackathonDto } from './dto/hackathon.dto.js';

@Injectable()
export class HackathonsService {
  constructor(private prisma: PrismaService) {}

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
}
