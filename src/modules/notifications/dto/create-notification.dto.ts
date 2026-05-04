import { NotificationChannel, NotificationPriority, NotificationStatus } from '@app/common/types/notifications.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.EMAIL })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({
    description: 'Recipient depends on the selected channel. Email for EMAIL, phone for SMS, token for PUSH.',
    example: 'user@example.com'
  })
  @ValidateIf((o: CreateNotificationDto) => o.channel === NotificationChannel.EMAIL)
  @IsEmail()
  @ValidateIf((o: CreateNotificationDto) => o.channel === NotificationChannel.SMS)
  @IsPhoneNumber()
  @ValidateIf((o: CreateNotificationDto) => o.channel === NotificationChannel.PUSH)
  @IsString()
  @IsNotEmpty()
  recipient!: string;

  @ApiProperty({ example: 'Your notification was sent successfully!' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ enum: NotificationPriority, example: NotificationPriority.LOW })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority: NotificationPriority = NotificationPriority.LOW;

  @ApiPropertyOptional({ example: { orderId: 'uuid', source: 'checkout' } })
  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
