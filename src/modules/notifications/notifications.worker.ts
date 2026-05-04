import { EmailService } from '../email/email.service';
import { PushService } from '../firebase/push.service';
import { SmsService } from '../sms/sms.service';
import { NotificationsService } from './notifications.service';
import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { NOTIFICATION_CREATED_EVENT, NOTIFICATION_RETRY_EVENT } from '@app/common/constants/notifications.constants';
import { NotificationCreatedEvent } from '@app/common/events/notification-created.event';
import { NotificationProviderService } from '@app/common/types/notification-provider.interface';
import { NotificationChannel, NotificationPriority, NotificationStatus } from '@app/common/types/notifications.type';
import { Controller, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy, Ctx, EventPattern, Payload, RmqContext, RmqRecordBuilder } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';

@Controller()
export class NotificationsWorker {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly providers: Record<string, NotificationProviderService>;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    @Inject(RABBITMQ_SERVICE)
    private client: ClientProxy
  ) {
    this.providers = {
      [NotificationChannel.EMAIL]: this.emailService,
      [NotificationChannel.SMS]: this.smsService,
      [NotificationChannel.PUSH]: this.pushService
    };
  }

  @EventPattern(NOTIFICATION_CREATED_EVENT)
  async handle(@Payload() data: NotificationCreatedEvent, @Ctx() context: RmqContext) {
    const { id, retryCount } = data;

    const rmqChannel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;

    try {
      this.logger.log(`[notification.created] Received event for Id: ${data.id}`);
      const notification = await this.notificationsService.findById(id);
      if (!notification) throw new NotFoundException(`Notification ${id} not found`);
      if (notification.status === NotificationStatus.SENT) {
        rmqChannel.ack(originalMessage);
        return;
      }

      const provider = this.providers[notification.channel];
      await provider.send(notification);
      await this.notificationsService.updateStatus(id, NotificationStatus.SENT);
      rmqChannel.ack(originalMessage);

      this.logger.log(`${NOTIFICATION_CREATED_EVENT} Successfully processed for Id: ${data.id}`);
    } catch (error) {
      this.logger.error(
        `${NOTIFICATION_CREATED_EVENT} Failed for Id: ${data.id} (retry ${data.retryCount ?? 0}/3)`,
        error
      );

      const record = new RmqRecordBuilder({
        id: data.id,
        retryCount: data.retryCount ?? 0
      }).build();
      this.client.emit(NOTIFICATION_RETRY_EVENT, record);
      rmqChannel.ack(originalMessage);
    }
  }
}
