import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideoResponseDto } from './dto/video-response.dto';

@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  /**
   * GET /api/videos
   * Retorna el listado limpio de videos con Nivel de Hype calculado.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): VideoResponseDto[] {
    return this.videosService.findAll();
  }
}
