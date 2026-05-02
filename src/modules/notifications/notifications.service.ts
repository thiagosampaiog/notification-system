import { CreateNotificationDto } from './dto/create-notification.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>
  ) {}

  public async create(input: CreateNotificationDto) {
    /* 
    1- Dto verify


    */
  }
}
