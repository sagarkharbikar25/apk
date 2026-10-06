import { Module } from '@nestjs/common';
import {
  HackathonsController,
  OrganizerHackathonsController,
} from './hackathons.controller.js';
import { HackathonsService } from './hackathons.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [HackathonsController, OrganizerHackathonsController],
  providers: [HackathonsService],
  exports: [HackathonsService],
})
export class HackathonsModule {}
