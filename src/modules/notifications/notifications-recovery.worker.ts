import { NotificationsService } from './notifications.service';
import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { NOTIFICATION_CREATED_EVENT, NOTIFICATION_RETRY_EVENT } from '@app/common/constants/notifications.constants';
import { NotificationCreatedEvent } from '@app/common/events/notification-created.event';
import { NotificationStatus } from '@app/common/types/notifications.type';
import { Controller, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy, Ctx, EventPattern, Payload, RmqContext, RmqRecordBuilder } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib';

@Controller()
export class NotificationsRecoveryWorker {
  private readonly logger = new Logger(NotificationsRecoveryWorker.name);

  constructor(
    @Inject(RABBITMQ_SERVICE)
    private client: ClientProxy,
    private readonly notificationsService: NotificationsService
  ) {}

  @EventPattern(NOTIFICATION_RETRY_EVENT)
  async handle(@Payload() data: NotificationCreatedEvent, @Ctx() context: RmqContext) {
    const rmqChannel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;
    try {
      const notification = await this.notificationsService.findById(data.id);
      if (!notification) throw new NotFoundException('notification not found');
      if (notification.status === NotificationStatus.SENT) {
        rmqChannel.ack(originalMessage);
        return;
      }
      const rmqPriority = this.notificationsService.mapPriority[notification.priority];

      const retryCount = data.retryCount ?? 0;

      if (retryCount < 3) {
        this.logger.log(`${NOTIFICATION_CREATED_EVENT} retry ${retryCount} event for Id: ${data.id}`);
        const record = new RmqRecordBuilder({ id: data.id, retryCount: retryCount + 1 })
          .setOptions({ priority: rmqPriority })
          .build();
        this.client.emit(NOTIFICATION_CREATED_EVENT, record);
        rmqChannel.ack(originalMessage);
      } else {
        this.logger.log(
          `${NOTIFICATION_RETRY_EVENT} failed retry event for Id: ${data.id} after retryCount: ${retryCount} `
        );
        await this.notificationsService.updateStatus(data.id, NotificationStatus.FAILED);
        rmqChannel.ack(originalMessage);
      }
    } catch (error) {
      this.logger.error(`${NOTIFICATION_RETRY_EVENT} Failed to retry process event for Id: ${data?.id}`, error);
      rmqChannel.nack(originalMessage, false, false);
    }
  }
}
