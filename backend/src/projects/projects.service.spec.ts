import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectsService } from './projects.service.js';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ApplicationStatus, ProjectType, Role } from '@prisma/client';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn((cb) => cb(mockPrisma)),
      project: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      projectRequirement: {
        createMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      projectMember: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      projectApplication: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new ProjectsService(mockPrisma);
  });

  describe('create', () => {
    it('should create a project with creator member and requirements in a transaction', async () => {
      const mockCreated = { id: 'p1', title: 'Test Project', creatorId: 'user-1' };
      mockPrisma.project.create.mockResolvedValue(mockCreated);

      const result = await service.create('user-1', {
        title: 'Test Project',
        description: 'Test Description',
        type: ProjectType.hackathon,
        maxMembers: 4,
        requiredSkillIds: ['s1', 's2'],
      });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.project.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated list and metadata', async () => {
      mockPrisma.project.count.mockResolvedValue(1);
      mockPrisma.project.findMany.mockResolvedValue([{ id: 'p1', title: 'Test Project' }]);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return project when found', async () => {
      const mockProject = { id: 'p1', title: 'Test Project' };
      mockPrisma.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.findOne('p1');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(service.findOne('p999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if user is not creator and not admin', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });

      await expect(
        service.update('p1', 'user-2', Role.student, { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update project if user is creator', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.project.update.mockResolvedValue({ id: 'p1', title: 'New Title' });

      const result = await service.update('p1', 'user-1', Role.student, { title: 'New Title' });
      expect(result.title).toBe('New Title');
    });

    it('should update project if user is admin', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.project.update.mockResolvedValue({ id: 'p1', title: 'Admin Title' });

      const result = await service.update('p1', 'admin-user', Role.admin, { title: 'Admin Title' });
      expect(result.title).toBe('Admin Title');
    });
  });

  describe('remove (soft-delete)', () => {
    it('should throw ForbiddenException if user is not creator and not admin', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });

      await expect(
        service.remove('p1', 'user-2', Role.student),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should soft-delete project setting deletedAt', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.project.update.mockResolvedValue({ id: 'p1', deletedAt: new Date() });

      const result = await service.remove('p1', 'user-1', Role.student);
      expect(result).toEqual({ message: 'Project deleted successfully' });
      expect(mockPrisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });

  describe('apply', () => {
    it('should throw ForbiddenException when creator applies to own project', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });

      await expect(
        service.apply('p1', 'user-1', { message: 'Hello' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.projectMember.findUnique.mockResolvedValue({ id: 'm1' });

      await expect(
        service.apply('p1', 'user-2', { message: 'Hello' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if duplicate active application exists', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.projectMember.findUnique.mockResolvedValue(null);
      mockPrisma.projectApplication.findFirst.mockResolvedValue({ id: 'app1', status: ApplicationStatus.pending });

      await expect(
        service.apply('p1', 'user-2', { message: 'Hello' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create an application successfully', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.projectMember.findUnique.mockResolvedValue(null);
      mockPrisma.projectApplication.findFirst.mockResolvedValue(null);
      mockPrisma.projectApplication.create.mockResolvedValue({
        id: 'app1',
        projectId: 'p1',
        applicantId: 'user-2',
        status: ApplicationStatus.pending,
      });

      const result = await service.apply('p1', 'user-2', { message: 'Excited to join' });
      expect(result.id).toBe('app1');
      expect(result.status).toBe(ApplicationStatus.pending);
    });
  });

  describe('getApplications', () => {
    it('should throw ForbiddenException if user is not creator and not admin', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });

      await expect(
        service.getApplications('p1', 'user-2', Role.student),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return list of applications for creator', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.projectApplication.findMany.mockResolvedValue([{ id: 'app1', status: ApplicationStatus.pending }]);

      const result = await service.getApplications('p1', 'user-1', Role.student);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateApplication', () => {
    it('should add applicant to ProjectMember when application is accepted', async () => {
      mockPrisma.project.findFirst.mockResolvedValue({ id: 'p1', creatorId: 'user-1' });
      mockPrisma.projectApplication.findFirst.mockResolvedValue({
        id: 'app1',
        projectId: 'p1',
        applicantId: 'applicant-1',
      });
      mockPrisma.projectApplication.update.mockResolvedValue({
        id: 'app1',
        status: ApplicationStatus.accepted,
      });

      const result = await service.updateApplication(
        'p1',
        'app1',
        'user-1',
        Role.student,
        { status: ApplicationStatus.accepted },
      );

      expect(result.status).toBe(ApplicationStatus.accepted);
      expect(mockPrisma.projectMember.upsert).toHaveBeenCalledWith({
        where: {
          projectId_userId: {
            projectId: 'p1',
            userId: 'applicant-1',
          },
        },
        update: {},
        create: {
          projectId: 'p1',
          userId: 'applicant-1',
          role: 'Member',
        },
      });
    });
  });
});
