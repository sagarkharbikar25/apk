import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { NotificationQueryDto } from './dto/notification.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications (paginated, unread filter)' })
  getUserNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }
}
