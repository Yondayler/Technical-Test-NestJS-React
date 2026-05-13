import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Videos API (e2e)', () => {
  let app: INestApplication<App>;

  // beforeAll en lugar de beforeEach: levantamos la app UNA sola vez
  // para todo el suite. Es más eficiente y refleja cómo funciona en producción.
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicar la configuración global de main.ts para que los tests
    // sean fieles al comportamiento real de la aplicación.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/videos ──────────────────────────────────────────────────────

  describe('GET /api/videos', () => {
    it('debería retornar 200 y un array de videos', () => {
      return request(app.getHttpServer())
        .get('/api/videos')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('debería retornar videos con el contrato de VideoResponseDto', () => {
      return request(app.getHttpServer())
        .get('/api/videos')
        .expect(200)
        .expect((res) => {
          const video = res.body[0];
          expect(video).toHaveProperty('id');
          expect(video).toHaveProperty('thumbnail');
          expect(video).toHaveProperty('title');
          expect(video).toHaveProperty('author');
          expect(video).toHaveProperty('publishedAt');
          expect(video).toHaveProperty('hypeLevel');
          expect(typeof video.hypeLevel).toBe('number');
        });
    });

    it('NO debería exponer publishedAtISO (campo @Excluded del DTO)', () => {
      return request(app.getHttpServer())
        .get('/api/videos')
        .expect(200)
        .expect((res) => {
          res.body.forEach((video: Record<string, unknown>) => {
            expect(video).not.toHaveProperty('publishedAtISO');
          });
        });
    });

    it('debería ordenar por hype descendente por defecto', () => {
      return request(app.getHttpServer())
        .get('/api/videos')
        .expect(200)
        .expect((res) => {
          const hypes: number[] = res.body.map((v: { hypeLevel: number }) => v.hypeLevel);
          for (let i = 1; i < hypes.length; i++) {
            expect(hypes[i]).toBeLessThanOrEqual(hypes[i - 1]);
          }
        });
    });

    it('debería ordenar por hype ascendente con sort=hype-asc', () => {
      return request(app.getHttpServer())
        .get('/api/videos?sort=hype-asc')
        .expect(200)
        .expect((res) => {
          const hypes: number[] = res.body.map((v: { hypeLevel: number }) => v.hypeLevel);
          for (let i = 1; i < hypes.length; i++) {
            expect(hypes[i]).toBeGreaterThanOrEqual(hypes[i - 1]);
          }
        });
    });

    it('debería filtrar por título con el parámetro search', () => {
      return request(app.getHttpServer())
        .get('/api/videos?search=react')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((v: { title: string }) => {
            expect(v.title.toLowerCase()).toContain('react');
          });
        });
    });

    it('debería retornar array vacío cuando la búsqueda no tiene resultados', () => {
      return request(app.getHttpServer())
        .get('/api/videos?search=xyzterminexistente999')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });

    it('debería admitir combinación de sort y search simultáneamente', () => {
      return request(app.getHttpServer())
        .get('/api/videos?sort=date-desc&search=tutorial')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((v: { title: string }) => {
            expect(v.title.toLowerCase()).toContain('tutorial');
          });
        });
    });

    it('debería retornar 400 cuando sort tiene un valor no permitido', () => {
      return request(app.getHttpServer())
        .get('/api/videos?sort=valor_inventado')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});
