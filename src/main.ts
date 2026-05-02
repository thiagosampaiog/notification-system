import { AppModule } from './app/app.module';
import { isDevEnv } from './infra/config/app.enviroment';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  const configService = app.get(ConfigService);
  const rabbitmqUrl = configService.getOrThrow<string>('queue.url') as string;
  const rabbitmqQueue = configService.getOrThrow<string>('queue.name') as string;
  const host = configService.getOrThrow('app.host');
  const port = configService.getOrThrow('app.port');

  app.use(helmet());
  app.setGlobalPrefix('/v1/api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.setGlobalPrefix('/v1/api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: { durable: true }
    }
  });

  await app.startAllMicroservices();

  const ALLOWED_ORIGINS = configService.getOrThrow('app.cors');
  app.enableCors({
    origin: isDevEnv ? true : ALLOWED_ORIGINS,
    preflight: true,
    credentials: true,
    maxAge: 600,
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  });
  await app.listen(port, host);
}
bootstrap();
