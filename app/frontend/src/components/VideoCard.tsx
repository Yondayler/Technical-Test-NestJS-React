import type { Video } from '../types/video';

// ── Skeleton ────────────────────────────────────────────────────
interface SkeletonCardProps { crown?: boolean; }

export function SkeletonCard({ crown = false }: SkeletonCardProps) {
  return (
    <div
      className={`skeleton-card ${crown ? 'video-card--crown' : ''}`}
      aria-hidden="true"
      style={crown ? { display: 'grid', gridTemplateColumns: '1.1fr 1fr' } : undefined}
    >
      <div className="skeleton skeleton-thumb" style={crown ? { minHeight: 220 } : undefined} />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line skeleton-line--long" />
        <div className="skeleton skeleton-line skeleton-line--short" />
        <div className="skeleton skeleton-line skeleton-line--xs" style={{ marginTop: 10 }} />
      </div>
    </div>
  );
}

// ── Hype bar ────────────────────────────────────────────────────
interface HypeBarProps { value: number; max: number; }

function HypeBar({ value, max }: HypeBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="card__hype">
      <span className="card__hype-label">Hype</span>
      <div className="card__hype-bar-track">
        <div
          className="card__hype-bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Nivel de hype: ${value.toFixed(3)}`}
        />
      </div>
      <span className="card__hype-value">{value.toFixed(3)}</span>
    </div>
  );
}

// ── Thumbnail ───────────────────────────────────────────────────────────────
interface ThumbnailProps {
  src: string;
  alt: string;
  eager?: boolean;
}

function Thumbnail({ src, alt, eager = false }: ThumbnailProps) {
  // via.placeholder.com está dado de baja permanentemente.
  // En lugar de usar un fallback onError (que causaría un request fallido),
  // corregimos la URL directamente antes de renderizar para optimizar la carga.
  // placehold.co es el reemplazo exacto y respeta los mismos colores/textos.
  const correctedUrl = src.replace('https://via.placeholder.com', 'https://placehold.co');

  return (
    <img
      className="card__thumbnail"
      src={correctedUrl}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      width={600}
      height={340}
    />
  );
}

// ── VideoCard ───────────────────────────────────────────────────
interface VideoCardProps {
  video: Video;
  maxHype: number;
  isCrown?: boolean;
  animationDelay?: number;
}

export function VideoCard({
  video,
  maxHype,
  isCrown = false,
  animationDelay = 0,
}: VideoCardProps) {
  return (
    <article
      className={`video-card ${isCrown ? 'video-card--crown' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      tabIndex={0}
      aria-label={`${video.title} por ${video.author}${isCrown ? ', Joya de la Corona' : ''}`}
    >
      {isCrown && (
        <span className="crown-badge" aria-label="Joya de la Corona">
          #1 Hype
        </span>
      )}

      <div className="card__thumbnail-wrap">
        <Thumbnail
          src={video.thumbnail}
          alt={`Miniatura: ${video.title}`}
          eager={isCrown}
        />
        <div className="card__play-overlay" aria-hidden="true">
          <div className="card__play-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="card__body">
        <h2 className="card__title">{video.title}</h2>
        <div className="card__meta">
          <span className="card__author">
            <span className="card__author-dot" aria-hidden="true" />
            {video.author}
          </span>
          <time className="card__date">{video.publishedAt}</time>
        </div>
        <HypeBar value={video.hypeLevel} max={maxHype} />
      </div>
    </article>
  );
}
