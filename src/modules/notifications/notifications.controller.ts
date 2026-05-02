import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() input: CreateNotificationDto) {
    return this.notificationsService.create(input);
  }
}
