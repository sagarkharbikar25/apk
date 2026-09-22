import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
