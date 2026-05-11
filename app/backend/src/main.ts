import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que el frontend React pueda consumir la API
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en: http://localhost:${port}`);
  console.log(`📺 Endpoint: http://localhost:${port}/api/videos`);
}

bootstrap();
