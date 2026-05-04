import { AppModule } from './app/app.module';
import { isDevEnv } from './infra/config/app.enviroment';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ClientProviderOptions, RmqOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const rabbitmqUrl = configService.getOrThrow<string>('queue.url') as string;
  const rabbitmqMainQueue = configService.getOrThrow<string>('queue.main_name') as string;
  const rabbitmqRecoveryQueue = configService.getOrThrow<string>('queue.recovery_name') as string;
  const host = configService.getOrThrow('app.host');
  const port = configService.getOrThrow('app.port');
  const appName = configService.getOrThrow<string>('app.name');

  app.use(helmet());
  app.setGlobalPrefix('/v1/api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const mainQueueMicroservice: RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqMainQueue,
      noAck: false,
      queueOptions: {
        durable: true,
        deadLetterExchange: '',
        prefetchCount: 1,
        deadLetterRoutingKey: rabbitmqRecoveryQueue,
        arguments: {
          'x-max-priority': 10
        }
      }
    }
  };

  const recoveryQueueMicroservice: RmqOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqRecoveryQueue,
      noAck: false,
      queueOptions: { durable: true, messageTtl: 300000, prefetchCount: 1 }
    }
  };

  app.connectMicroservice<RmqOptions>(mainQueueMicroservice);
  app.connectMicroservice<RmqOptions>(recoveryQueueMicroservice);

  await app.startAllMicroservices();

  const ALLOWED_ORIGINS = configService.getOrThrow('app.cors');
  app.enableCors({
    origin: isDevEnv ? true : ALLOWED_ORIGINS,
    preflight: true,
    credentials: true,
    maxAge: 600,
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  });

  const config = new DocumentBuilder().setTitle('Notification System').setVersion('1.0').addBearerAuth().build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(port, host);
  logger.log(
    `${appName} started listening on host: ${host}, port: ${port}, queues: ${rabbitmqMainQueue} & ${rabbitmqRecoveryQueue}`
  );
}
bootstrap();
