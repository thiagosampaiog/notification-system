import { Notification } from './entities/notification.entity';
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
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): RmqOptions => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('queue.url')],
            queue: configService.getOrThrow<string>('queue.name'),
            queueOptions: {
              durable: true
            }
          }
        })
      }
    ])
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController, NotificationsWorker],
  exports: [NotificationsService]
})
export class NotificationsModule {}
