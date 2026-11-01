import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);

  const port = Number(config.get('PORT')) || 3000;

  const rabbitmqUrl =
    config.get<string>('RABBITMQ_URL') ??
    'amqp://guest:guest@localhost:5672';

  const enableRabbit =
    config.get<string>('ENABLE_RABBITMQ') === 'true';

  if (enableRabbit) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'shipment_queue',
        queueOptions: {
          durable: true,
        },
        noAck: false,
      },
    });
  }

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Logistics API')
    .setDescription(
      'Logistics Tracking System API — AI Route Optimization, Auto Dispatch, WMS, Barcode/QR, SLA Monitoring, Fraud Detection, IoT Tracking',
    )
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);

  // Start RabbitMQ only if enabled
  if (enableRabbit) {
    try {
      await app.startAllMicroservices();
      logger.log(`RabbitMQ connected: ${rabbitmqUrl}`);
    } catch (error) {
      logger.error('RabbitMQ failed to start.');
      logger.error(error);
    }
  } else {
    logger.warn('RabbitMQ is disabled.');
  }

  await app.listen(port);

  logger.log(`🚀 API      : http://localhost:${port}`);
  logger.log(`📚 Swagger : http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error(err);
});