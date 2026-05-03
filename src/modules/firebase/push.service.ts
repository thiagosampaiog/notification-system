import { Notification } from '../notifications/entities/notification.entity';
import { NotificationProviderService } from '@app/common/types/notification-provider.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService implements NotificationProviderService {
  constructor(private readonly configService: ConfigService) {
    const projectId = configService.getOrThrow<string>('firebase.project_id');
    const privateKey = configService.getOrThrow<string>('firebase.private_key');
    const clientEmail = configService.getOrThrow<string>('firebase.client_email');

    admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail,
        privateKey,
        projectId
      })
    });
  }

  async send(notification: Notification) {
    await admin.messaging().send({
      token: notification.recipient,
      notification: {
        title: 'Notification',
        body: notification.message
      }
    });
  }
}
