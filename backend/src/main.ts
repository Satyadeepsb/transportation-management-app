import 'dotenv/config'; // Load environment variables first
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  // Supports comma-separated origins via CORS_ORIGIN env var
  // Production origins are always allowed alongside any configured origins
  const productionOrigins = [
    'https://tms-frontend.satyadeepsb.workers.dev',
  ];
  const configuredOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
  const allowedOrigins = [...new Set([...productionOrigins, ...configuredOrigins])];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
  });

  // Global validation pipe for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert string to number, etc.
      },
    }),
  );

  // Global prefix for all REST routes (GraphQL not affected)
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🚀 GraphQL Playground: http://localhost:${port}/graphql`);
}

bootstrap();
