import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class VideoResponseDto {
  @Expose()
  id: string;

  @Expose()
  thumbnail: string;

  @Expose()
  title: string;

  @Expose()
  author: string;

  @Expose()
  publishedAt: string;

  @Expose()
  hypeLevel: number;

  constructor(partial: Partial<VideoResponseDto>) {
    Object.assign(this, partial);
  }
}
