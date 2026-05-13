import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
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
interface HypeBarProps { value: number; max: number; isCrown?: boolean; }

function HypeBar({ value, max, isCrown = false }: HypeBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fillRef.current) return;
    gsap.fromTo(
      fillRef.current,
      { width: '0%' },
      { width: `${pct}%`, duration: isCrown ? 1.2 : 0.9, ease: 'power3.out', delay: isCrown ? 0.6 : 0.2 }
    );
  }, [pct, isCrown]);

  return (
    <div className="card__hype">
      <span className="card__hype-label">Hype</span>
      <div className="card__hype-bar-track">
        <div
          ref={fillRef}
          className="card__hype-bar-fill"
          style={{ width: '0%' }}
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

// ── Thumbnail ───────────────────────────────────────────────────
function Thumbnail({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
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

// ── CrownCard — Joya de la Corona con animaciones GSAP ──────────
interface CrownCardProps { video: Video; maxHype: number; }

export function CrownCard({ video, maxHype }: CrownCardProps) {
  const cardRef  = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Card enters from below
      tl.fromTo(cardRef.current, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, 0);
      // Badge pops in
      tl.fromTo(badgeRef.current, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.7)' }, '<0.3');
      // Title appears
      tl.fromTo(titleRef.current, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, '<0.1');
      // Meta row
      tl.fromTo(metaRef.current, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, '<0.1');
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    // The wrapper isolates the glow & badge from the grid flow
    <div className="crown-card-wrapper">
      {/* Ambient glow — outside the grid article */}
      <div className="crown-glow" aria-hidden="true" />

      <article
        ref={cardRef}
        className="video-card video-card--crown"
        tabIndex={0}
        aria-label={`${video.title} por ${video.author}, Joya de la Corona`}
      >
        {/* Badge is inside the article but absolute-positioned */}
        <span ref={badgeRef} className="crown-badge" aria-label="Joya de la Corona">
          #1 Hype
        </span>

        {/* Grid item 1: Thumbnail */}
        <div className="card__thumbnail-wrap">
          <Thumbnail src={video.thumbnail} alt={`Miniatura: ${video.title}`} eager />
          <div className="card__play-overlay" aria-hidden="true">
            <div className="card__play-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Grid item 2: Body */}
        <div className="card__body">
          <div>
            <h2 ref={titleRef} className="card__title">{video.title}</h2>
            <div ref={metaRef} className="card__meta">
              <span className="card__author">
                <span className="card__author-dot" aria-hidden="true" />
                {video.author}
              </span>
              <time className="card__date">{video.publishedAt}</time>
            </div>
          </div>
          <HypeBar value={video.hypeLevel} max={maxHype} isCrown />
        </div>
      </article>
    </div>
  );
}

// ── VideoCard (grid cards) ──────────────────────────────────────
interface VideoCardProps { video: Video; maxHype: number; animationDelay?: number; }

export function VideoCard({ video, maxHype, animationDelay = 0 }: VideoCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              cardRef.current,
              { y: 12, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.55, delay: animationDelay / 1000, ease: 'power3.out' }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [animationDelay]);

  return (
    <article
      ref={cardRef}
      className="video-card"
      tabIndex={0}
      aria-label={`${video.title} por ${video.author}`}
    >
      <div className="card__thumbnail-wrap">
        <Thumbnail src={video.thumbnail} alt={`Miniatura: ${video.title}`} />
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
