import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class VideoResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Identificador único del video',
    example: 'vid_001',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'URL de la miniatura de alta resolución',
    example: 'https://placehold.co/300x200/1a1a2e/ffffff?text=React',
  })
  thumbnail: string;

  @Expose()
  @ApiProperty({
    description: 'Título del video',
    example: 'React 19 - Novedades completas',
  })
  title: string;

  @Expose()
  @ApiProperty({
    description: 'Nombre del canal / autor',
    example: 'CodeWithMe',
  })
  author: string;

  @Expose()
  @ApiProperty({
    description:
      'Fecha de publicación en formato relativo amigable (calculado sin librerías)',
    example: 'Hace 2 meses',
  })
  publishedAt: string;

  // Campo interno para ordenamiento — NO se expone en la respuesta JSON
  publishedAtISO: string;

  @Expose()
  @ApiProperty({
    description:
      'Nivel de Hype calculado: (likes + comentarios) / vistas. ' +
      'Se multiplica x2 si el título contiene “Tutorial”. ' +
      'Es 0 si los comentarios están desactivados o las vistas son 0.',
    example: 0.3084,
  })
  hypeLevel: number;

  constructor(partial: Partial<VideoResponseDto>) {
    Object.assign(this, partial);
  }
}
