import {
  NotificationChannel,
  NotificationStatus,
  NotificationPriority
} from '@app/common/types/notifications.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ enum: NotificationChannel, type: 'enum' })
  channel!: NotificationChannel;

  @Column({ type: 'varchar' })
  recipient!: string;

  @Column({ type: 'varchar' })
  message!: string;

  @Column({ enum: NotificationPriority, type: 'enum' })
  priority!: NotificationPriority;

  @Column({ type: 'jsonb', nullable: true })
  data!: Record<string, unknown>;

  @Column({
    enum: NotificationStatus,
    type: 'enum',
    default: NotificationStatus.PENDING
  })
  status!: NotificationStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
