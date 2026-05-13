import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { YouTubeVideoItem } from './interfaces/youtube-api.interface';

// Helper para construir un item de YouTube mock.
// Cuando commentCount NO se pasa en overrides, se añade por defecto ('50').
// Cuando se pasa explícitamente como undefined, NO se añade la propiedad al objeto
// (simulando que YouTube no envía la propiedad → comentarios desactivados).
function buildMockItem(
  overrides: {
    id?: string;
    title?: string;
    viewCount?: string;
    likeCount?: string;
    commentCount?: string; // si NO se pasa esta key, se añade '50' por defecto
    disableComments?: boolean; // true → NO añade la propiedad commentCount
  } = {},
): YouTubeVideoItem {
  const {
    id = 'vid_test',
    title = 'Test Video',
    viewCount = '1000',
    likeCount = '100',
    commentCount = '50',
    disableComments = false,
  } = overrides;

  const stats: YouTubeVideoItem['statistics'] = {
    viewCount,
    likeCount,
  };

  // Solo añadimos commentCount si los comentarios NO están desactivados
  if (!disableComments) {
    stats.commentCount = commentCount;
  }

  return {
    id,
    snippet: {
      title,
      channelTitle: 'TestChannel',
      publishedAt: new Date().toISOString(),
      thumbnails: { high: { url: 'https://example.com/thumb.jpg' } },
    },
    statistics: stats,
  };
}

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideosService],
    }).compile();

    service = module.get<VideosService>(VideosService);
  });

  // ─── calculateHype ────────────────────────────────────────────────────────

  describe('calculateHype()', () => {
    it('debería calcular el hype base correctamente: (likes + comments) / views', () => {
      const item = buildMockItem({
        viewCount: '1000',
        likeCount: '100',
        commentCount: '50',
      });
      // (100 + 50) / 1000 = 0.15
      expect(service.calculateHype(item)).toBe(0.15);
    });

    it('debería multiplicar x2 cuando el título contiene "Tutorial" (mayúsculas)', () => {
      const item = buildMockItem({
        title: 'TypeScript Tutorial',
        viewCount: '1000',
        likeCount: '100',
        commentCount: '50',
      });
      // (100 + 50) / 1000 * 2 = 0.30
      expect(service.calculateHype(item)).toBe(0.3);
    });

    it('debería multiplicar x2 cuando el título contiene "tutorial" (minúsculas)', () => {
      const item = buildMockItem({
        title: 'React en 10 minutos - tutorial',
        viewCount: '1000',
        likeCount: '100',
        commentCount: '50',
      });
      expect(service.calculateHype(item)).toBe(0.3);
    });

    it('debería multiplicar x2 cuando el título contiene "TuToRiaL" (mixed case)', () => {
      const item = buildMockItem({
        title: 'React avanzado - TuToRiaL',
        viewCount: '1000',
        likeCount: '100',
        commentCount: '50',
      });
      expect(service.calculateHype(item)).toBe(0.3);
    });

    it('debería retornar 0 cuando los comentarios están desactivados (sin propiedad commentCount)', () => {
      const item = buildMockItem({ disableComments: true });
      expect(service.calculateHype(item)).toBe(0);
    });

    it('debería retornar 0 cuando viewCount es 0 (evitar división por cero)', () => {
      const item = buildMockItem({
        viewCount: '0',
        likeCount: '0',
        commentCount: '0',
      });
      expect(service.calculateHype(item)).toBe(0);
    });

    it('debería retornar 0 cuando comentarios desactivados, aunque el título diga "Tutorial"', () => {
      const item = buildMockItem({
        title: 'Gran Tutorial',
        disableComments: true,
      });
      // Sin commentCount → Hype = 0 sin importar el título
      expect(service.calculateHype(item)).toBe(0);
    });

    it('debería procesar correctamente los valores tipo string del JSON', () => {
      // Los valores vienen como strings desde el JSON de YouTube
      const item = buildMockItem({
        viewCount: '100000',
        likeCount: '5000',
        commentCount: '250',
      });
      // (5000 + 250) / 100000 = 0.0525
      expect(service.calculateHype(item)).toBe(0.0525);
    });
  });

  // ─── getRelativeTime ──────────────────────────────────────────────────────

  describe('getRelativeTime()', () => {
    it('debería retornar "Hace unos segundos" para fechas muy recientes', () => {
      const now = new Date().toISOString();
      expect(service.getRelativeTime(now)).toBe('Hace unos segundos');
    });

    it('debería retornar "Hace 1 minuto" para 90 segundos atrás', () => {
      const date = new Date(Date.now() - 90 * 1000).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 1 minuto');
    });

    it('debería retornar "Hace X minutos" para varios minutos atrás', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 5 minutos');
    });

    it('debería retornar "Hace 1 día" para 25 horas atrás', () => {
      const date = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 1 día');
    });

    it('debería retornar "Hace X días" para varios días atrás', () => {
      const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 5 días');
    });

    it('debería retornar "Hace 1 mes" para ~31 días atrás', () => {
      const date = new Date(
        Date.now() - 31 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 1 mes');
    });

    it('debería retornar "Hace X meses" para varios meses atrás', () => {
      const date = new Date(
        Date.now() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 3 meses');
    });

    it('debería retornar "Hace 1 año" para ~366 días atrás', () => {
      const date = new Date(
        Date.now() - 366 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 1 año');
    });

    it('debería retornar "Hace X años" para varios años atrás', () => {
      const date = new Date(
        Date.now() - 730 * 24 * 60 * 60 * 1000,
      ).toISOString();
      expect(service.getRelativeTime(date)).toBe('Hace 2 años');
    });
  });
});
