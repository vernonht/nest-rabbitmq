import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy for correct IP detection behind reverse proxies
  (app.getHttpAdapter().getInstance() as Express).set('trust proxy', 1);

  // Register global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Queue Management System')
    .setDescription('API for managing orders, bots, and queue processing')
    .setVersion('1.0.0')
    .addTag('Orders')
    .addTag('Bots')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
