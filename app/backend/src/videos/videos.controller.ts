import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { VideoResponseDto } from './dto/video-response.dto';
import { VideoQueryDto } from './dto/video-query.dto';

@ApiTags('videos')
@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  /**
   * GET /api/videos
   * Retorna el listado de videos con Nivel de Hype calculado.
   *
   * Query params opcionales:
   *   - sort: 'hype-desc' | 'hype-asc' | 'date-desc' | 'date-asc' | 'title-asc'
   *           (default: 'hype-desc')
   *   - search: string  (filtra por título, case-insensitive)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los videos con su Nivel de Hype',
    description:
      'Retorna la lista de videos del mock de YouTube transformados y enriquecidos. ' +
      'Cada video incluye miniatura, título, autor, fecha relativa y el Nivel de Hype calculado. ' +
      'Soporta ordenamiento multidimensional y búsqueda por título en el backend.',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['hype-desc', 'hype-asc', 'date-desc', 'date-asc', 'title-asc'],
    description:
      'Criterio de ordenamiento. Por defecto: hype-desc (mayor Hype primero)',
    example: 'hype-desc',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Filtra videos cuyo título contenga este texto (case-insensitive)',
    example: 'react',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de videos procesados ordenada según el criterio solicitado.',
    type: [VideoResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno al leer el archivo de datos mock.',
  })
  findAll(@Query() query: VideoQueryDto): VideoResponseDto[] {
    return this.videosService.findAll(query);
  }
}
