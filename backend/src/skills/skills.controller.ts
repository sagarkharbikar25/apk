import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkillsService } from './skills.service.js';
import { SkillQueryDto } from './dto/skill.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available skills with optional category/search filters (Redis-cached)' })
  getAll(@Query() query: SkillQueryDto) {
    return this.skillsService.getAll(query);
  }
}
