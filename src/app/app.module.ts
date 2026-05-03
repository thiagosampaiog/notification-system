import { AuthGuard } from '../common/guards/auth.guard';
import { CustomThrottlerGuard } from '../common/guards/throttler.guard';
import { environment } from '../infra/config/app.enviroment';
import appConfig from '../infra/config/env/app.config';
import authConfig from '../infra/config/env/auth.config';
import cacheConfig from '../infra/config/env/cache.config';
import { validate } from '../infra/config/env/env.validation';
import queueConfig from '../infra/config/env/queue.config';
import typeormConfig from '../infra/config/env/typeorm.config';
import { AuthModule } from '../modules/auth/auth.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { UsersModule } from '../modules/users/users.module';
import awsConfig from '@app/infra/config/env/aws.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${(environment || 'development').trim()}`,
      validate,
      load: [authConfig, queueConfig, typeormConfig, appConfig, cacheConfig, awsConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getOrThrow<TypeOrmModuleOptions>('typeorm')
    }),
    ThrottlerModule.forRoot([
      {
        ttl: minutes(5),
        limit: 600
      }
    ]),
    UsersModule,
    AuthModule,
    NotificationsModule,
    JwtModule.registerAsync(authConfig.asProvider())
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
