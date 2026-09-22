import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service.js';
import {
  CreateTeamDto,
  JoinTeamDto,
  InviteMemberDto,
  RespondInvitationDto,
  TeamQueryDto,
} from './dto/team.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team (generates QR code token in Redis)' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List teams (paginated, project filter)' })
  findAll(@Query() query: TeamQueryDto) {
    return this.teamsService.findAll(query);
  }

  @Get('invitations/me')
  @ApiOperation({ summary: 'Get all pending invitations for current user' })
  getMyInvitations(@CurrentUser('id') userId: string) {
    return this.teamsService.getMyInvitations(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full team details and member list' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join team (optionally via Redis QR token)' })
  join(
    @CurrentUser('id') userId: string,
    @Param('id') teamId: string,
    @Body() dto: JoinTeamDto,
  ) {
    return this.teamsService.join(userId, teamId, dto);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to the team (Admin only, sends FCM push)' })
  invite(
    @CurrentUser('id') inviterId: string,
    @Param('id') teamId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.teamsService.invite(teamId, inviterId, dto);
  }

  @Patch('invitations/:id')
  @ApiOperation({ summary: 'Accept or decline a team invitation' })
  respondInvitation(
    @CurrentUser('id') userId: string,
    @Param('id') invitationId: string,
    @Body() dto: RespondInvitationDto,
  ) {
    return this.teamsService.respondInvitation(invitationId, userId, dto);
  }
}
