import appConfig from './infra/config/env/app.config';
import authConfig from './infra/config/env/auth.config';
import cacheConfig from './infra/config/env/cache.config';
import databaseConfig from './infra/config/env/database.config';
import { getEnv, validate } from './infra/config/env/env.validation';
import queueConfig from './infra/config/env/queue.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';

const ENV_MODE = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV_MODE ? '.env' : `.env.${ENV_MODE.trim()}`,
      validate,
      load: [authConfig, queueConfig, databaseConfig, appConfig, cacheConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.getOrThrow<TypeOrmModuleOptions>('database')
    })
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
