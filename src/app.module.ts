import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getEnv, validate } from './infra/config/env.validation';


const env = getEnv()

const ENV_MODE = env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV_MODE ? '.env' : `.env.${ENV_MODE.trim()}`,
      validate,
      load: [],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
