import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @Inject(RABBITMQ_SERVICE)
    private readonly client: ClientProxy
  ) {}

  public async create(input: CreateNotificationDto) {
    const { channel, message, priority, recipient, data } = input;
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

    // Save in-memory
    const notification = this.notificationsRepository.create(input);
    const saved = await this.notificationsRepository.save(notification);
    return saved;
  }
}
