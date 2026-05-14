import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import type { LayoutProps, SortKey, StyleKey } from '../types';
import { VideoCard, CrownCard, SkeletonCard } from '../../components/VideoCard';

// ── Título animado letra por letra ────────────────────────────
function AnimatedTitle({ styleKey }: { styleKey: string }) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll<HTMLElement>('.title-char');
    
    // Matar animaciones previas para evitar conflictos
    gsap.killTweensOf(chars);
    
    gsap.fromTo(
      chars,
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.045,
        ease: 'power3.out',
        delay: 0.1,
      },
    );
  }, [styleKey]);

  return (
    <h1
      ref={containerRef}
      className="header__title"
      aria-label="HypeBoard"
    >
      {'HypeBoard'.split('').map((char, i) => (
        <span
          key={i}
          className="title-char"
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const STYLES: { value: StyleKey; label: string; emoji: string }[] = [
  { value: 'minimalist', label: 'Minimalist', emoji: '✦' },
  { value: 'youtube',    label: 'YouTube',    emoji: '▶' },
  { value: 'cyberpunk',  label: 'Cyberpunk',  emoji: '⚡' },
  { value: 'netflix',    label: 'Netflix',    emoji: 'N' },
  { value: 'appletv',    label: 'HypeTV+',    emoji: '' },
];

function StyleSwitcher({ styleKey, onChange }: { styleKey: StyleKey; onChange: (s: StyleKey) => void }) {
  return (
    <div className="style-switcher" role="group" aria-label="Seleccionar estilo visual">
      {STYLES.map((s) => (
        <button
          key={s.value}
          className={`style-btn ${styleKey === s.value ? 'style-btn--active' : ''}`}
          onClick={() => onChange(s.value)}
          aria-pressed={styleKey === s.value}
          title={s.label}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            justifyContent: 'center',
            padding: '8px 16px'
          }}
        >
          <span style={{ 
            color: s.value === 'youtube' || s.value === 'netflix' ? '#ff0000' : 'inherit', 
            fontWeight: s.value === 'netflix' ? '900' : 'inherit',
            display: 'flex',
            alignItems: 'center',
            fontSize: s.value === 'appletv' ? '1.1rem' : 'inherit'
          }}>
            {s.value === 'appletv' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            ) : s.emoji}
          </span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'hype-desc', label: 'Mayor Hype' },
  { value: 'hype-asc',  label: 'Menor Hype' },
  { value: 'date-desc', label: 'Más reciente' },
  { value: 'date-asc',  label: 'Más antiguo' },
  { value: 'title-asc', label: 'Título A–Z' },
];

interface SortBarProps {
  sort: SortKey;
  onSort: (key: SortKey) => void;
  search: string;
  onSearch: (q: string) => void;
  total: number;
}

function SortBar({ sort, onSort, search, onSearch, total }: SortBarProps) {
  return (
    <div className="sort-bar" role="toolbar" aria-label="Filtros y ordenamiento">
      <div className="sort-bar__search">
        <svg className="sort-bar__search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="sort-bar__input"
          type="text"
          placeholder="Buscar video..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Buscar video por título"
        />
        {search && (
          <button className="sort-bar__clear" onClick={() => onSearch('')} aria-label="Limpiar búsqueda">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      <span className="sort-bar__count" aria-live="polite">
        {total} video{total !== 1 ? 's' : ''}
      </span>

      <div className="sort-bar__options" role="group" aria-label="Ordenar por">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`sort-btn ${sort === opt.value ? 'sort-btn--active' : ''}`}
            onClick={() => onSort(opt.value as SortKey)}
            aria-pressed={sort === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MinimalistLayout({
  videos,
  loading,
  error,
  refetch,
  sort,
  onSort,
  search,
  onSearch,
  theme,
  toggleTheme,
  styleKey,
  onStyleChange
}: LayoutProps) {
  const maxHype = videos.length > 0 ? Math.max(...videos.map((v) => v.hypeLevel)) : 0;
  const crownVideo = videos.find((v) => v.hypeLevel === maxHype) ?? null;
  const restVideos = videos.filter((v) => v !== crownVideo);

  return (
    <div className="app">
      <header className="header" role="banner">
        <p className="header__eyebrow">Cartelera de conocimiento</p>
        <AnimatedTitle styleKey={styleKey} />
        <p className="header__subtitle">
          Videos tech rankeados por engagement real, no por views.
        </p>
        <StyleSwitcher styleKey={styleKey} onChange={onStyleChange} />

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="main" id="main-content" role="main">
        {loading && (
          <>
            <section className="crown-section" aria-label="Cargando joya de la corona">
              <div className="section-label crown-label">Joya de la Corona</div>
              <SkeletonCard crown />
            </section>
            <section className="grid-section" aria-label="Cargando videos">
              <div className="section-label">Todos los videos</div>
              <div className="video-grid" role="list">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
          </>
        )}

        {!loading && error && (
          <div className="error-state" role="alert" aria-live="assertive">
            <div className="error-state__icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="error-state__title">No se pudieron cargar los videos</h2>
            <p className="error-state__message">{error}</p>
            <p className="error-state__message" style={{ marginTop: 4 }}>
              Asegúrate de que el backend esté corriendo en{' '}
              <code style={{ fontFamily: 'Geist Mono, monospace', color: 'var(--accent)' }}>
                localhost:3001
              </code>
            </p>
            <button
              className="error-state__retry"
              onClick={refetch}
              aria-label="Reintentar carga de videos"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <>
            {crownVideo && (
              <section className="crown-section" aria-labelledby="crown-heading">
                <div className="section-label crown-label" id="crown-heading">
                  Joya de la Corona
                </div>
                <CrownCard key={`crown-${styleKey}-${crownVideo.id}`} video={crownVideo} maxHype={maxHype} />
              </section>
            )}

            <section className="grid-section" aria-labelledby="grid-heading">
              <div className="section-label" id="grid-heading">
                Todos los videos
                <span style={{ color: 'var(--text-tertiary)', fontFamily: 'Geist Mono, monospace', fontSize: '10px' }}>
                  {restVideos.length}
                </span>
              </div>

              <SortBar
                sort={sort}
                onSort={onSort}
                search={search}
                onSearch={onSearch}
                total={restVideos.length}
              />

              {restVideos.length > 0 ? (
                <div className="video-grid" role="list">
                  {restVideos.map((video, i) => (
                    <div key={video.id} role="listitem">
                      <VideoCard key={`${video.id}-${styleKey}`} video={video} maxHype={maxHype} animationDelay={Math.min(i * 20, 60)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="error-state" style={{ minHeight: 160 }} role="status">
                  <p className="error-state__message">
                    Sin resultados para "<strong>{search}</strong>"
                  </p>
                  <button className="error-state__retry" onClick={() => onSearch('')}>
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="error-state" role="status">
            <h2 className="error-state__title">Sin videos disponibles</h2>
            <p className="error-state__message">El backend no retornó ningún video.</p>
          </div>
        )}
      </main>

      <footer className="footer" role="contentinfo">
        HypeBoard &mdash; Prueba técnica &middot; NestJS + React
      </footer>
    </div>
  );
}
