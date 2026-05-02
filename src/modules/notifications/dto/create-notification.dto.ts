import { NotificationChannel, NotificationPriority, NotificationStatus } from '@app/common/types/notifications.type';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf
} from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ValidateIf((o: CreateNotificationDto) => o.channel === NotificationChannel.EMAIL)
  @IsEmail()

  @ValidateIf((o: CreateNotificationDto) => o.channel === NotificationChannel.SMS)
  @IsPhoneNumber('BR')

  @ValidateIf((o: CreateNotificationDto) => o.channel === NotificationChannel.PUSH)
  @IsString()
  
  @IsNotEmpty()
  recipient!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority: NotificationPriority = NotificationPriority.LOW;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
