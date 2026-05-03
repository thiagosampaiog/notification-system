import { Notification } from '../notifications/entities/notification.entity';
import { NotificationProviderService } from '@app/common/types/notification-provider.interface';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements NotificationProviderService {
  private sesClient: SESClient;
  private sourceEmail: string;
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('aws.ses.region');
    const accessKeyId = this.configService.getOrThrow<string>('aws.accessKey');
    const secretAccessKey = this.configService.getOrThrow<string>('aws.secretKey');

    this.sesClient = new SESClient({
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      region
    });

    this.sourceEmail = configService.getOrThrow<string>('aws.ses.sourceEmail');

    this.logger.log({ region }, 'SES service initialized');
  }

  async send(notification: Notification) {
    await this.sesClient.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [notification.recipient] },
        Message: {
          Subject: { Data: 'Notification' },
          Body: { Text: { Data: notification.message } }
        },
        Source: this.sourceEmail
      })
    );
  }
}
