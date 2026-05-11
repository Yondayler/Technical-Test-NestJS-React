export interface YouTubeThumbnail {
  url: string;
}

export interface YouTubeSnippet {
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    high: YouTubeThumbnail;
  };
}

export interface YouTubeStatistics {
  viewCount: string;
  likeCount: string;
  commentCount?: string; // Puede estar ausente (comentarios desactivados)
}

export interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeSnippet;
  statistics: YouTubeStatistics;
}

export interface YouTubeApiResponse {
  kind: string;
  items: YouTubeVideoItem[];
}
