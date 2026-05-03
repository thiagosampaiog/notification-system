import { NotificationsService } from './notifications.service';
import { NotificationCreatedEvent } from '@app/common/events/notification-created.event';
import { NotificationProviderService } from '@app/common/types/notification-provider.interface';
import { NotificationChannel, NotificationStatus } from '@app/common/types/notifications.type';
import { Controller, Logger, NotFoundException } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationsWorker {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly providers: Record<string, NotificationProviderService>;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    // private readonly smsService: SmsService,
    // private readonly pushService: PushService
  ) {
    // this.providers = {
    //   [NotificationChannel.EMAIL]: this.emailService,
    //   [NotificationChannel.SMS]: this.smsService,
    //   [NotificationChannel.PUSH]: this.pushService
    // };
  }

  @EventPattern('notification.created')
  async handle(@Payload() data: NotificationCreatedEvent, @Ctx() context: RmqContext) {
    const { id, priority } = data;

    const rmqChannel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.logger.log(`[notification.created] Received event for Id: ${data.id}`);

      const notification = await this.notificationsService.findById(id);
      if (!notification) throw new NotFoundException(`Notification ${id} not found`);
      const provider = this.emailService
      await provider.send(notification);
      await this.notificationsService.updateStatus(id, NotificationStatus.SENT);
      /* 
      TODO: Add priority, retry queue, dlq
      */

      rmqChannel.ack(originalMessage);

      this.logger.log(`[notification.created] Successfully processed for Id: ${data.id}`);
    } catch (error) {
      this.logger.error(`[notification.created] Failed to process event for Id: ${data?.id}`, error);

      rmqChannel.nack(originalMessage, false, false);
    }
  }
}
