import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ApplyProjectDto,
  UpdateApplicationDto,
  InviteProjectMemberDto,
} from './dto/project.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Role } from '@prisma/client';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active projects (paginated, filterable)' })
  findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get project details by ID' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project (Creator or Admin only)' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, userId, userRole, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete project (Creator or Admin only)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.remove(id, userId, userRole);
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply to join a project' })
  apply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyProjectDto,
  ) {
    return this.projectsService.apply(id, userId, dto);
  }

  @Get(':id/applications')
  @ApiOperation({ summary: 'Get all applications for a project (Creator only)' })
  getApplications(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.projectsService.getApplications(id, userId, userRole);
  }

  @Patch(':id/applications/:appId')
  @ApiOperation({ summary: 'Accept or reject an application (Creator only)' })
  updateApplication(
    @Param('id') projectId: string,
    @Param('appId') appId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.projectsService.updateApplication(
      projectId,
      appId,
      userId,
      userRole,
      dto,
    );
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to join project (Project members only)' })
  invite(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteProjectMemberDto,
  ) {
    return this.projectsService.invite(projectId, userId, dto);
  }
}
