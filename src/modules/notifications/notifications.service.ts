import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { NotificationCreatedEvent } from '@app/common/events/notification-created.event';
import { NotificationStatus } from '@app/common/types/notifications.type';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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

  public async create(input: CreateNotificationDto) {
    // Services Record: email: this.sesService, sms: this.smsService, push: this.fcmService ( at the worker )
    /* 
    save at db now or at the worker? : 
    channel
    recipient
    message
    priority
    data?
    status pending
    then:
    this.rabbitmqChannel.send() or eventEmitter?
    return 201 created or 200 OK
    rabbitmq choose the order by priority
    */
    const notification = this.notificationsRepository.create(input);
    const saved = await this.notificationsRepository.save(notification);

    this.client.emit<void, NotificationCreatedEvent>('notification.created', {
      id: saved.id,
      priority: saved.priority
    });

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
