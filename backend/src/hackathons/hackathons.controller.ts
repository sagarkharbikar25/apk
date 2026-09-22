import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HackathonsService } from './hackathons.service.js';
import {
  HackathonQueryDto,
  RegisterHackathonDto,
} from './dto/hackathon.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

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
}
