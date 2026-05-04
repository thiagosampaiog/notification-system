import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { NOTIFICATION_CREATED_EVENT } from '@app/common/constants/notifications.constants';
import { NotificationPriority, NotificationStatus } from '@app/common/types/notifications.type';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @Inject(RABBITMQ_SERVICE)
    private client: ClientProxy
  ) {}

  public mapPriority = {
    [NotificationPriority.HIGH]: 10,
    [NotificationPriority.MEDIUM]: 5,
    [NotificationPriority.LOW]: 1
  };

  public async create(input: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(input);
    const saved = await this.notificationsRepository.save(notification);

    const rmqPriority = this.mapPriority[notification.priority];

    const record = new RmqRecordBuilder({ id: saved.id }).setOptions({ priority: rmqPriority }).build();

    this.client.emit(NOTIFICATION_CREATED_EVENT, record);

    return saved;
  }

  public async findById(id: string) {
    return this.notificationsRepository.findOne({
      where: {
        id: id
      }
    });
  }

  public async updateStatus(id: string, status: NotificationStatus) {
    const notification = await this.findById(id);
    if (!notification) throw new NotFoundException('Notification not found');
    notification.status = status;
    return this.notificationsRepository.save(notification);
  }
}
