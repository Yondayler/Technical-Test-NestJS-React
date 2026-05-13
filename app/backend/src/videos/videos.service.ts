import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  YouTubeApiResponse,
  YouTubeVideoItem,
} from './interfaces/youtube-api.interface';
import { VideoResponseDto } from './dto/video-response.dto';
import { VideoQueryDto, SortKey } from './dto/video-query.dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  /**
   * Retorna el listado de videos procesados con Nivel de Hype calculado.
   * Acepta parámetros opcionales de ordenamiento y búsqueda por título.
   */
  findAll(query: VideoQueryDto = {}): VideoResponseDto[] {
    const rawData = this.loadMockData();
    let videos = rawData.items.map((item) => this.transformVideo(item));

    // Búsqueda por título (case-insensitive)
    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      videos = videos.filter((v) => v.title.toLowerCase().includes(q));
    }

    // Ordenamiento
    videos = this.sortVideos(videos, query.sort ?? 'hype-desc');

    return videos;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private sortVideos(
    videos: VideoResponseDto[],
    sort: SortKey,
  ): VideoResponseDto[] {
    return [...videos].sort((a, b) => {
      switch (sort) {
        case 'hype-desc':
          return b.hypeLevel - a.hypeLevel;
        case 'hype-asc':
          return a.hypeLevel - b.hypeLevel;
        case 'date-desc':
          return (
            new Date(b.publishedAtISO).getTime() -
            new Date(a.publishedAtISO).getTime()
          );
        case 'date-asc':
          return (
            new Date(a.publishedAtISO).getTime() -
            new Date(b.publishedAtISO).getTime()
          );
        case 'title-asc':
          return a.title.localeCompare(b.title, 'es');
        default:
          return 0;
      }
    });
  }

  private loadMockData(): YouTubeApiResponse {
    try {
      // process.cwd() apunta a app/backend/
      const filePath = path.join(process.cwd(), 'mock-youtube-api.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as YouTubeApiResponse;
    } catch (error) {
      this.logger.error('Error al leer el archivo mock de YouTube', error);
      throw new InternalServerErrorException(
        'No se pudieron cargar los datos de videos',
      );
    }
  }

  private transformVideo(item: YouTubeVideoItem): VideoResponseDto {
    const hypeLevel = this.calculateHype(item);
    const publishedAt = this.getRelativeTime(item.snippet.publishedAt);

    return new VideoResponseDto({
      id: item.id,
      thumbnail: item.snippet.thumbnails.high.url,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      publishedAt,
      publishedAtISO: item.snippet.publishedAt,
      hypeLevel,
    });
  }

  /**
   * Calcula el Nivel de Hype según las reglas de negocio:
   * 1. Fórmula base: (likes + comentarios) / vistas
   * 2. Si el título contiene "tutorial" (case-insensitive) → Hype x2
   * 3. Si no tiene propiedad commentCount → Hype = 0
   * 4. Si vistas = 0 → Hype = 0 (evitar división por cero)
   */
  calculateHype(item: YouTubeVideoItem): number {
    const { statistics, snippet } = item;

    // Regla 3: comentarios desactivados (la propiedad NO existe en el objeto)
    if (
      !('commentCount' in statistics) ||
      statistics.commentCount === undefined
    ) {
      return 0;
    }

    const views = Number(statistics.viewCount);
    const likes = Number(statistics.likeCount);
    const comments = Number(statistics.commentCount);

    // Regla 4: evitar división por cero
    if (views === 0) {
      return 0;
    }

    let hype = (likes + comments) / views;

    // Regla 2: multiplicador por "Tutorial" (case-insensitive)
    if (snippet.title.toLowerCase().includes('tutorial')) {
      hype *= 2;
    }

    // Redondear a 4 decimales para limpieza del JSON
    return Math.round(hype * 10000) / 10000;
  }

  /**
   * Convierte una fecha ISO a texto relativo amigable.
   * Implementado con JavaScript nativo puro (sin librerías).
   * Ej: "Hace 2 meses", "Hace 5 días", "Hace 1 año"
   */
  getRelativeTime(isoDate: string): string {
    const now = new Date();
    const published = new Date(isoDate);
    const diffMs = now.getTime() - published.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years >= 1) {
      return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
    }
    if (months >= 1) {
      return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
    }
    if (days >= 1) {
      return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
    }
    if (hours >= 1) {
      return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
    }
    if (minutes >= 1) {
      return minutes === 1 ? 'Hace 1 minuto' : `Hace ${minutes} minutos`;
    }
    return 'Hace unos segundos';
  }
}
