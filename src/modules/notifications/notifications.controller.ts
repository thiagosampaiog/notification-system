import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Create a notification' })
  @ApiCreatedResponse({ description: 'Notification created successfully' })
  @Post()
  async create(@Body() input: CreateNotificationDto) {
    return this.notificationsService.create(input);
  }
}
