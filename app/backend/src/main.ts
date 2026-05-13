import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que el frontend React pueda consumir la API
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET'],
  });

  // Validación global: activa los decoradores de class-validator en todos los DTOs
  // (@IsIn, @IsString, @IsOptional, etc.). Sin esto, esas anotaciones son código muerto
  // y la API acepta cualquier valor en los query params.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: false, // no rechazar props extras, solo ignorarlas
      transform: true,        // convierte tipos automáticamente (string → enum)
    }),
  );

  // Serialización global: aplica @Exclude() / @Expose() de class-transformer
  // en todas las respuestas. Sin esto, los campos sin @Expose() (como publishedAtISO)
  // se filtrarían al cliente igualmente porque NestJS haría JSON.stringify() directo.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ── Swagger / OpenAPI ────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('HypeBoard API')
    .setDescription(
      'API que procesa un mock de YouTube y calcula el **Nivel de Hype** ' +
        'de cada video en base a likes, comentarios y vistas. ' +
        'Soporta ordenamiento y búsqueda backend-driven.',
    )
    .setVersion('1.0')
    .addTag('videos', 'Operaciones sobre el catálogo de videos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'HypeBoard API Docs',
    swaggerOptions: {
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en: http://localhost:${port}`);
  console.log(`📺 Endpoint:             http://localhost:${port}/api/videos`);
  console.log(`📖 Documentación:        http://localhost:${port}/api/docs`);
}

void bootstrap();
