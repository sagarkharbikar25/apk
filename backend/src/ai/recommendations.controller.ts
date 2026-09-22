import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service.js';
import { RecommendationQueryDto } from './dto/ai.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Recommendations')
@ApiBearerAuth('access-token')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  @ApiOperation({
    summary: 'Get AI recommendations (teammates if projectId provided, projects if omitted)',
  })
  getRecommendations(
    @CurrentUser('id') userId: string,
    @Query() query: RecommendationQueryDto,
  ) {
    return this.aiService.getRecommendations(userId, query.projectId);
  }
}
