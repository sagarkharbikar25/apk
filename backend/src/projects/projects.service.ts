import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ApplyProjectDto,
  UpdateApplicationDto,
  InviteProjectMemberDto,
} from './dto/project.dto.js';
import { ApplicationStatus, Role } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ── POST /projects ──────────────────────────────────────────
  async create(userId: string, dto: CreateProjectDto) {
    const { requiredSkillIds, ...projectData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...projectData,
          creatorId: userId,
          members: {
            create: {
              userId,
              role: 'Creator',
            },
          },
          ...(requiredSkillIds && requiredSkillIds.length > 0 && {
            requirements: {
              create: requiredSkillIds.map((skillId) => ({
                skillId,
                isRequired: true,
              })),
            },
          }),
        },
        include: {
          creator: {
            select: { id: true, email: true, profile: true },
          },
          requirements: {
            include: { skill: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, profile: true },
              },
            },
          },
        },
      });

      return project;
    });
  }

  // ── GET /projects ───────────────────────────────────────────
  async findAll(query: ProjectQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.skillId && {
        requirements: {
          some: { skillId: query.skillId },
        },
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
          creator: {
            select: { id: true, email: true, profile: true },
          },
          requirements: {
            include: { skill: true },
          },
          _count: {
            select: { members: true, applications: true },
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

  // ── GET /projects/:id ───────────────────────────────────────
  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        creator: {
          select: { id: true, email: true, profile: true },
        },
        requirements: {
          include: { skill: true },
        },
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
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  // ── PATCH /projects/:id ─────────────────────────────────────
  async update(id: string, userId: string, userRole: Role, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.creatorId !== userId && userRole !== Role.admin) {
      throw new ForbiddenException('Only the project creator or an admin can update this project');
    }

    const { requiredSkillIds, ...updateData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (requiredSkillIds !== undefined) {
        await tx.projectRequirement.deleteMany({ where: { projectId: id } });
        if (requiredSkillIds.length > 0) {
          await tx.projectRequirement.createMany({
            data: requiredSkillIds.map((skillId) => ({
              projectId: id,
              skillId,
              isRequired: true,
            })),
          });
        }
      }

      return tx.project.update({
        where: { id },
        data: updateData,
        include: {
          creator: { select: { id: true, email: true, profile: true } },
          requirements: { include: { skill: true } },
          members: {
            include: {
              user: { select: { id: true, profile: true } },
            },
          },
        },
      });
    });
  }

  // ── DELETE /projects/:id (Soft-Delete) ───────────────────────
  async remove(id: string, userId: string, userRole: Role) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.creatorId !== userId && userRole !== Role.admin) {
      throw new ForbiddenException('Only the project creator or an admin can delete this project');
    }

    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Project deleted successfully' };
  }

  // ── POST /projects/:id/apply ────────────────────────────────
  async apply(id: string, userId: string, dto: ApplyProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // 1. Cannot apply to own project
    if (project.creatorId === userId) {
      throw new ForbiddenException('Cannot apply to your own project');
    }

    // 2. Cannot apply if already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId } },
    });
    if (existingMember) {
      throw new ConflictException('You are already a member of this project');
    }

    // 3. Cannot apply if duplicate active application exists
    const existingApp = await this.prisma.projectApplication.findFirst({
      where: {
        projectId: id,
        applicantId: userId,
        status: { in: [ApplicationStatus.pending, ApplicationStatus.accepted] },
      },
    });
    if (existingApp) {
      throw new ConflictException('You already have an active application for this project');
    }

    return this.prisma.projectApplication.create({
      data: {
        projectId: id,
        applicantId: userId,
        message: dto?.message,
        status: ApplicationStatus.pending,
      },
      include: {
        project: { select: { id: true, title: true } },
      },
    });
  }

  // ── GET /projects/:id/applications ──────────────────────────
  async getApplications(id: string, userId: string, userRole: Role) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.creatorId !== userId && userRole !== Role.admin) {
      throw new ForbiddenException('Only the project creator can view project applications');
    }

    return this.prisma.projectApplication.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            profile: true,
            userSkills: { include: { skill: true } },
          },
        },
      },
    });
  }

  // ── PATCH /projects/:id/applications/:appId ─────────────────
  async updateApplication(
    projectId: string,
    appId: string,
    userId: string,
    userRole: Role,
    dto: UpdateApplicationDto,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.creatorId !== userId && userRole !== Role.admin) {
      throw new ForbiddenException('Only the project creator can update applications');
    }

    const application = await this.prisma.projectApplication.findFirst({
      where: { id: appId, projectId },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${appId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedApp = await tx.projectApplication.update({
        where: { id: appId },
        data: { status: dto.status },
      });

      // If accepted, add user to project_members if not present
      if (dto.status === ApplicationStatus.accepted) {
        await tx.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId,
              userId: application.applicantId,
            },
          },
          update: {},
          create: {
            projectId,
            userId: application.applicantId,
            role: 'Member',
          },
        });
      }

      return updatedApp;
    });
  }

  // ── POST /projects/:id/invite ───────────────────────────────
  async invite(projectId: string, userId: string, dto: InviteProjectMemberDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: { members: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Must be a project member or creator to invite
    const isMember =
      project.members.some((m) => m.userId === userId) ||
      project.creatorId === userId;
    if (!isMember) {
      throw new ForbiddenException('Only project members can invite users to this project');
    }

    if (project.members.length >= project.maxMembers) {
      throw new ConflictException('Project has reached its maximum member capacity');
    }

    if (
      project.members.some((m) => m.userId === dto.inviteeId) ||
      project.creatorId === dto.inviteeId
    ) {
      throw new ConflictException('User is already a member of this project');
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.inviteeId,
        role: dto.role || 'Member',
      },
      include: {
        user: { select: { id: true, email: true, profile: true } },
      },
    });
  }
}
