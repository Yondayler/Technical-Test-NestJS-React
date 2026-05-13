import './index.css';
import { useState, useEffect } from 'react';
import { useVideos } from './hooks/useVideos';
import { useDebounce } from './hooks/useDebounce';
import { MinimalistLayout } from './themes/minimalist/MinimalistLayout';
import { YouTubeLayout } from './themes/youtube/YouTubeLayout';
import type { SortKey, StyleKey } from './themes/types';

// ── Hook de tema con persistencia en localStorage ──────────────
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('hype-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hype-theme', theme);
  }, [theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.body.classList.add('theme-ready');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

function useStyle() {
  const [style, setStyle] = useState<StyleKey>(() => {
    const s = localStorage.getItem('hype-style');
    if (s === 'minimalist' || s === 'youtube') return s as StyleKey;
    return 'minimalist';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-style', style);
    localStorage.setItem('hype-style', style);
  }, [style]);

  return { style, setStyle };
}

// ── App ────────────────────────────────────────────────────────
function App() {
  const [sort, setSort] = useState<SortKey>('hype-desc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const { theme, toggle } = useTheme();
  const { style, setStyle } = useStyle();

  const { data: videos, loading, error, refetch } = useVideos({ sort, search: debouncedSearch });

  const layoutProps = {
    videos,
    loading,
    error,
    refetch,
    sort,
    onSort: setSort,
    search,
    onSearch: setSearch,
    theme,
    toggleTheme: toggle,
    styleKey: style,
    onStyleChange: setStyle,
  };

  if (style === 'youtube') {
    return <YouTubeLayout {...layoutProps} />;
  }

  // Fallback / Default
  return <MinimalistLayout {...layoutProps} />;
}

export default App;
