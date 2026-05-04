import { EmailModule } from '../email/email.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { SmsModule } from '../sms/sms.module';
import { Notification } from './entities/notification.entity';
import { NotificationsRecoveryWorker } from './notifications-recovery.worker';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsWorker } from './notifications.worker';
import { RABBITMQ_SERVICE } from '@app/common/constants/injection-tokens';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqOptions, ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EmailModule,
    SmsModule,
    FirebaseModule,
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): RmqOptions => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('queue.url')],
            queue: configService.getOrThrow<string>('queue.main_name'),
            queueOptions: {
              durable: true,
              deadLetterExchange: '',
              deadLetterRoutingKey: configService.getOrThrow<string>('queue.recovery_name'),
              arguments: {
                'x-max-priority': 10
              }
            }
          }
        })
      }
    ])
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController, NotificationsWorker, NotificationsRecoveryWorker],
  exports: [NotificationsService]
})
export class NotificationsModule {}
