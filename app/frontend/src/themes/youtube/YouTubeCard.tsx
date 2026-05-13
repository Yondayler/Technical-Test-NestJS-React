import React from 'react';
import type { Video } from '../../types/video';

interface YouTubeCardProps {
  video: Video;
  rank: number; // We'll use rank or hype to show something interesting
}

export function YouTubeCard({ video, rank }: YouTubeCardProps) {
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
