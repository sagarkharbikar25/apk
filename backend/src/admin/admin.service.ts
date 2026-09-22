import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AdminUserQueryDto,
  AdminProjectQueryDto,
  CreateHackathonDto,
  AuditLogQueryDto,
} from './dto/admin.dto.js';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── GET /admin/users ────────────────────────────────────────
  async getUsers(query: AdminUserQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.role && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { profile: { displayName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          profile: true,
          _count: {
            select: {
              createdProjects: true,
              projectMembers: true,
              teamMembers: true,
            },
          },
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

  // ── PATCH /admin/users/:id/status ───────────────────────────
  async updateUserStatus(adminId: string, targetUserId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Record in audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entityType: 'User',
        entityId: targetUserId,
        metadata: { previousState: user.isActive, newState: isActive },
      },
    });

    return updatedUser;
  }

  // ── GET /admin/projects ─────────────────────────────────────
  async getProjects(query: AdminProjectQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, email: true, profile: true } },
          requirements: { include: { skill: true } },
          _count: { select: { members: true, applications: true } },
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

  // ── GET /admin/hackathons ───────────────────────────────────
  async getHackathons() {
    return this.prisma.hackathon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: { select: { id: true, email: true, profile: true } },
        _count: { select: { participants: true } },
      },
    });
  }

  // ── POST /admin/hackathons ──────────────────────────────────
  async createHackathon(organizerId: string, dto: CreateHackathonDto) {
    return this.prisma.hackathon.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        registrationDeadline: new Date(dto.registrationDeadline),
        maxTeamSize: dto.maxTeamSize || 4,
        organizerId,
      },
    });
  }

  // ── GET /admin/analytics/summary ────────────────────────────
  async getAnalyticsSummary() {
    const [
      totalUsers,
      activeUsers,
      totalTeams,
      totalProjects,
      activeHackathons,
      topSkillsRaw,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.team.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.hackathon.count({ where: { isActive: true } }),
      this.prisma.userSkill.groupBy({
        by: ['skillId'],
        _count: { skillId: true },
        orderBy: { _count: { skillId: 'desc' } },
        take: 10,
      }),
    ]);

    // Populate skill names
    const skillIds = topSkillsRaw.map((s) => s.skillId);
    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds } },
    });
    const skillMap = new Map(skills.map((s) => [s.id, s.name]));

    const skillDistribution = topSkillsRaw.map((item) => ({
      skillId: item.skillId,
      skillName: skillMap.get(item.skillId) || 'Unknown',
      userCount: item._count.skillId,
    }));

    return {
      totalUsers,
      activeUsers,
      totalTeams,
      totalProjects,
      activeHackathons,
      skillDistribution,
    };
  }

  // ── GET /admin/audit-logs ───────────────────────────────────
  async getAuditLogs(query: AuditLogQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.userId && { userId: query.userId }),
      ...(query.action && { action: { contains: query.action, mode: 'insensitive' } }),
    };

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
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
}
