import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Video } from '../../types/video';

interface YouTubeCardProps {
  video: Video;
  rank: number;
  animationDelay?: number;
}

export function YouTubeCard({ video, rank, animationDelay = 0 }: YouTubeCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, delay: animationDelay / 1000, ease: 'power2.out' }
    );
  }, []);

  const correctedUrl = video.thumbnail.replace('https://via.placeholder.com', 'https://placehold.co');
  
  // Format hype to look like views (e.g. 0.308 -> 308K views)
  const views = Math.floor(video.hypeLevel * 1000) + 'K';
  
  return (
    <article className={`yt-card ${rank === 1 ? 'yt-card--crown' : ''}`}>
      <div className="yt-card__thumbnail">
        <img src={correctedUrl} alt={video.title} loading="lazy" />
        <span className="yt-card__duration">10:04</span>
      </div>
      <div className="yt-card__details">
        <div className="yt-card__avatar">
          {/* Use dicebear for a random avatar based on author name */}
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${video.author}&backgroundColor=333333`} alt={video.author} />
        </div>
        <div className="yt-card__text">
          <h3 className="yt-card__title" title={video.title}>{video.title}</h3>
          <div className="yt-card__meta">
            <span className="yt-card__author">{video.author}</span>
            <div className="yt-card__stats">
              <span>{views} visualizaciones</span>
              <span className="yt-card__dot">•</span>
              <span>{video.publishedAt}</span>
            </div>
            {rank === 1 && (
              <span className="yt-card__badge">#1 en Tendencias</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function YouTubeSkeletonCard() {
  return (
    <div className="yt-card yt-skeleton">
      <div className="yt-card__thumbnail skeleton-thumb"></div>
      <div className="yt-card__details">
        <div className="yt-card__avatar skeleton-avatar"></div>
        <div className="yt-card__text" style={{ width: '100%' }}>
          <div className="skeleton-line" style={{ height: 16, width: '90%', marginBottom: 8 }}></div>
          <div className="skeleton-line" style={{ height: 14, width: '60%', marginBottom: 4 }}></div>
          <div className="skeleton-line" style={{ height: 14, width: '40%' }}></div>
        </div>
      </div>
    </div>
  );
}
