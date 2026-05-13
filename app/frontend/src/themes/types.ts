import type { Video } from '../types/video';

// Mismos tipos que definimos en App
export type SortKey = 'hype-desc' | 'hype-asc' | 'date-desc' | 'date-asc' | 'title-asc';
export type StyleKey = 'minimalist' | 'youtube';

export interface LayoutProps {
  videos: Video[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  
  sort: SortKey;
  onSort: (key: SortKey) => void;
  
  search: string;
  onSearch: (q: string) => void;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  styleKey: StyleKey;
  onStyleChange: (s: StyleKey) => void;
}
