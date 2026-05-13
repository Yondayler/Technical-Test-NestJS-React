import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export type SortKey =
  | 'hype-desc'
  | 'hype-asc'
  | 'date-desc'
  | 'date-asc'
  | 'title-asc';

export class VideoQueryDto {
  @IsOptional()
  @IsIn(['hype-desc', 'hype-asc', 'date-desc', 'date-asc', 'title-asc'])
  @ApiPropertyOptional({
    enum: ['hype-desc', 'hype-asc', 'date-desc', 'date-asc', 'title-asc'],
    default: 'hype-desc',
    description: 'Criterio de ordenamiento',
  })
  sort?: SortKey = 'hype-desc';

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Texto para filtrar por título (case-insensitive)',
    example: 'react',
  })
  search?: string;
}
