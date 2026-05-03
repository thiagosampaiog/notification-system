import { NotificationPriority } from '../types/notifications.type';

export class NotificationCreatedEvent {
  id: string;
  priority: NotificationPriority;
}
