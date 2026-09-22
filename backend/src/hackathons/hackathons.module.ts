import { Module } from '@nestjs/common';
import { HackathonsController } from './hackathons.controller.js';
import { HackathonsService } from './hackathons.service.js';

@Module({
  controllers: [HackathonsController],
  providers: [HackathonsService],
  exports: [HackathonsService],
})
export class HackathonsModule {}
