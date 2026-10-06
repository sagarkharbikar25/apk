import {
  Controller,
  Post,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service.js';
import {
  AnalyzeProjectDto,
  SkillGapDto,
  RecommendationQueryDto,
  ExtractSkillsDto,
  TeamRequirementsDto,
} from './dto/ai.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('extract-skills')
  @ApiOperation({
    summary: 'Extract skills from text (up to 2000 chars, 10/min rate limit)',
  })
  extractSkills(@Body() dto: ExtractSkillsDto) {
    return this.aiService.extractSkills(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('team-requirements')
  @ApiOperation({
    summary: 'Extract required skills from team description (10/min rate limit)',
  })
  extractTeamRequirements(@Body() dto: TeamRequirementsDto) {
    return this.aiService.extractTeamRequirements(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('analyze-project')
  @ApiOperation({
    summary: 'Extract skills, domains, and roles from project description using Gemini (10/min rate limit)',
  })
  analyzeProject(@Body() dto: AnalyzeProjectDto) {
    return this.aiService.analyzeProject(dto);
  }

  @Post('skill-gap')
  @ApiOperation({
    summary: 'Evaluate missing skills against project or target skills and get learning path suggestions',
  })
  getSkillGap(
    @CurrentUser('id') userId: string,
    @Body() dto: SkillGapDto,
  ) {
    return this.aiService.getSkillGap(userId, dto);
  }

  @Get('recommendations')
  @ApiOperation({
    summary: 'Get AI-driven teammate or project recommendations (Redis-cached 30m)',
  })
  getRecommendations(
    @CurrentUser('id') userId: string,
    @Query() query: RecommendationQueryDto,
  ) {
    return this.aiService.getRecommendations(userId, query.projectId);
  }
}
