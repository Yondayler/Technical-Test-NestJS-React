/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VideoResponseDto } from './dto/video-response.dto';
import { VideoQueryDto } from './dto/video-query.dto';

// Mock del dataset que devolverá el service mockeado
const mockVideos: VideoResponseDto[] = [
  new VideoResponseDto({
    id: 'vid_001',
    thumbnail: 'https://via.placeholder.com/300x200',
    title: 'React Hooks en profundidad - Tutorial',
    author: 'CodeWithMe',
    publishedAt: 'Hace 2 días',
    publishedAtISO: '2026-05-11T10:00:00Z',
    hypeLevel: 0.35,
  }),
  new VideoResponseDto({
    id: 'vid_002',
    thumbnail: 'https://via.placeholder.com/300x200',
    title: 'NestJS desde cero',
    author: 'BackendPro',
    publishedAt: 'Hace 1 mes',
    publishedAtISO: '2026-04-13T10:00:00Z',
    hypeLevel: 0.12,
  }),
];

describe('VideosController', () => {
  let controller: VideosController;
  let service: jest.Mocked<VideosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        {
          provide: VideosService,
          useValue: {
            findAll: jest.fn().mockReturnValue(mockVideos),
          },
        },
      ],
    }).compile();

    controller = module.get<VideosController>(VideosController);
    service = module.get(VideosService);
  });

  // ─── findAll() ────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('debería llamar al service con la query recibida y retornar su resultado', () => {
      const query: VideoQueryDto = {};
      const result = controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockVideos);
    });

    it('debería pasar el parámetro sort al service sin modificarlo', () => {
      const query: VideoQueryDto = { sort: 'hype-asc' };
      controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({ sort: 'hype-asc' });
    });

    it('debería pasar el parámetro search al service sin modificarlo', () => {
      const query: VideoQueryDto = { search: 'react' };
      controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({ search: 'react' });
    });

    it('debería pasar sort y search combinados al service', () => {
      const query: VideoQueryDto = { sort: 'date-desc', search: 'tutorial' };
      controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({
        sort: 'date-desc',
        search: 'tutorial',
      });
    });

    it('debería retornar array vacío si el service no encuentra resultados', () => {
      service.findAll.mockReturnValueOnce([]);
      const result = controller.findAll({ search: 'xyz' });

      expect(result).toEqual([]);
    });

    it('el controller es una capa delgada: devuelve exactamente lo que el service retorna', () => {
      const subset = [mockVideos[0]];
      service.findAll.mockReturnValueOnce(subset);

      const result = controller.findAll({ search: 'react' });

      // Misma referencia — el controller no transforma ni clona el resultado
      expect(result).toBe(subset);
    });
  });
});
