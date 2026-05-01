import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate,
      load: [databaseConfig, authConfig, appConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
