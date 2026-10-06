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
import { Throttle } from '@nestjs/throttler';
import { HackathonsService } from './hackathons.service.js';
import {
  HackathonQueryDto,
  RegisterHackathonDto,
  CreateHackathonDto,
  UpdateHackathonDto,
  ParticipantQueryDto,
  CheckInDto,
  AnnounceDto,
} from './dto/hackathon.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Hackathons')
@ApiBearerAuth('access-token')
@Controller('hackathons')
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List hackathons (paginated, active filter)' })
  findAll(@Query() query: HackathonQueryDto) {
    return this.hackathonsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get hackathon details and participants' })
  findOne(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Register for a hackathon individually or with a team' })
  register(
    @CurrentUser('id') userId: string,
    @Param('id') hackathonId: string,
    @Body() dto: RegisterHackathonDto,
  ) {
    return this.hackathonsService.register(userId, hackathonId, dto);
  }

  @Roles('organizer')
  @Post()
  @ApiOperation({ summary: 'Create a new hackathon (Organizer only)' })
  create(
    @CurrentUser('id') organizerId: string,
    @Body() dto: CreateHackathonDto,
  ) {
    return this.hackathonsService.create(organizerId, dto);
  }

  @Roles('organizer')
  @Patch(':id')
  @ApiOperation({ summary: 'Update hackathon details (Owner only)' })
  update(
    @CurrentUser('id') organizerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateHackathonDto,
  ) {
    return this.hackathonsService.update(organizerId, id, dto);
  }

  @Roles('organizer')
  @Get(':id/participants')
  @ApiOperation({ summary: 'List hackathon participants with teamless filter (Owner only)' })
  getParticipants(
    @CurrentUser('id') organizerId: string,
    @Param('id') id: string,
    @Query() query: ParticipantQueryDto,
  ) {
    return this.hackathonsService.getParticipants(organizerId, id, query);
  }

  @Roles('organizer')
  @Get(':id/teams')
  @ApiOperation({ summary: 'List squads and members for hackathon (Owner only)' })
  getTeams(
    @CurrentUser('id') organizerId: string,
    @Param('id') id: string,
  ) {
    return this.hackathonsService.getTeams(organizerId, id);
  }

  @Roles('organizer')
  @Patch(':id/participants/:userId/check-in')
  @ApiOperation({ summary: 'Check in a participant (Owner only)' })
  checkIn(
    @CurrentUser('id') organizerId: string,
    @Param('id') hackathonId: string,
    @Param('userId') userId: string,
    @Body() dto: CheckInDto,
  ) {
    return this.hackathonsService.checkIn(organizerId, hackathonId, userId, dto.checkedIn);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Roles('organizer')
  @Post(':id/announce')
  @ApiOperation({ summary: 'Broadcast push announcement to all registrants (Owner only, 5/min limit)' })
  announce(
    @CurrentUser('id') organizerId: string,
    @Param('id') hackathonId: string,
    @Body() dto: AnnounceDto,
  ) {
    return this.hackathonsService.announce(organizerId, hackathonId, dto);
  }
}

@ApiTags('Organizer')
@ApiBearerAuth('access-token')
@Roles('organizer')
@Controller('organizer/hackathons')
export class OrganizerHackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get organizer own hackathons with stats' })
  getMyHackathons(@CurrentUser('id') organizerId: string) {
    return this.hackathonsService.getOrganizerHackathons(organizerId);
  }
}
