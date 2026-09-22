import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { RecommendationsController } from './recommendations.controller.js';
import { AiService } from './ai.service.js';
import { GeminiService } from './gemini.service.js';

@Module({
  controllers: [AiController, RecommendationsController],
  providers: [AiService, GeminiService],
  exports: [AiService, GeminiService],
})
export class AiModule {}
