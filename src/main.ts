import { AppModule } from './app.module';
import { isDevEnv } from './infra/config/app.enviroment';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['warn', 'error', 'log'],
    
  });
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.setGlobalPrefix('/v1/api')

  const ALLOWED_ORIGINS = configService.getOrThrow('app.cors');
  app.enableCors({
    origin: isDevEnv ? true : ALLOWED_ORIGINS,
    preflight: true,
    credentials: true,
    maxAge: 600,
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  });
  await app.listen(configService.get('app.port') || 3001);
}
bootstrap();
