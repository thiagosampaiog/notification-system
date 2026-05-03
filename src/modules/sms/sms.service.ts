import { Notification } from '../notifications/entities/notification.entity';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;
  private phoneNumber: string;
  private serviceSid: string;
  private readonly logger = new Logger(SmsService.name)

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.getOrThrow<string>('sms.account_sid');
    const authToken = configService.getOrThrow<string>('sms.auth_token');

    this.client = new Twilio(accountSid, authToken);
    this.phoneNumber = configService.getOrThrow<string>('sms.sender_number');
    this.serviceSid = configService.getOrThrow<string>('sms.service_sid');

    this.logger.log(`Twillio Service intialized`)
  }

  async send(notification: Notification): Promise<void> {
    await this.client.messages.create({
      to: notification.recipient,
      from: this.phoneNumber,
      body: notification.message
    });
  }
}
