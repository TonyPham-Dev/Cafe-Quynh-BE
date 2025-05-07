import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { createLogger } from 'winston';
import { LOGGER_OPTIONS } from './configs/logger.config';
import { WinstonLogger } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(createLogger(LOGGER_OPTIONS)),
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  // Patch Swagger for Zod
  patchNestjsSwagger();

  const config = new DocumentBuilder()
    .setTitle('Telecom API')
    .setDescription('API for Telecom product')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'refresh-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const APP_PORT = configService.get('app.port');
  await app.listen(APP_PORT);
  const logger = new Logger('Main');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
