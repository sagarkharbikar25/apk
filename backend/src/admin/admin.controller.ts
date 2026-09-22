import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import {
  AdminUserQueryDto,
  UpdateUserStatusDto,
  AdminProjectQueryDto,
  CreateHackathonDto,
  AuditLogQueryDto,
} from './dto/admin.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users with search and filter (Admin only)' })
  getUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate user account (Admin only)' })
  updateUserStatus(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(adminId, id, dto.isActive);
  }

  @Get('projects')
  @ApiOperation({ summary: 'List all projects (Admin only)' })
  getProjects(@Query() query: AdminProjectQueryDto) {
    return this.adminService.getProjects(query);
  }

  @Get('hackathons')
  @ApiOperation({ summary: 'List all hackathons (Admin only)' })
  getHackathons() {
    return this.adminService.getHackathons();
  }

  @Post('hackathons')
  @ApiOperation({ summary: 'Create a new hackathon (Admin only)' })
  createHackathon(
    @CurrentUser('id') organizerId: string,
    @Body() dto: CreateHackathonDto,
  ) {
    return this.adminService.createHackathon(organizerId, dto);
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get high-level platform analytics & stats (Admin only)' })
  getAnalyticsSummary() {
    return this.adminService.getAnalyticsSummary();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Query audit logs (Admin only)' })
  getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminService.getAuditLogs(query);
  }
}
