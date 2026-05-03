import { Notification } from '@app/modules/notifications/entities/notification.entity';

export interface NotificationProviderService {
  send(notification: Notification): Promise<void>;
}
