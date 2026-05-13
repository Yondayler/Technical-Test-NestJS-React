import './index.css';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useVideos } from './hooks/useVideos';
import { useDebounce } from './hooks/useDebounce';
import { VideoCard, CrownCard, SkeletonCard } from './components/VideoCard';

// ── Tipos de ordenamiento ───────────────────────────────────────
type SortKey = 'hype-desc' | 'hype-asc' | 'date-desc' | 'date-asc' | 'title-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'hype-desc', label: 'Mayor Hype' },
  { value: 'hype-asc',  label: 'Menor Hype' },
  { value: 'date-desc', label: 'Más reciente' },
  { value: 'date-asc',  label: 'Más antiguo' },
  { value: 'title-asc', label: 'Título A–Z' },
];

// ── Título animado letra por letra ────────────────────────────
function AnimatedTitle() {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll<HTMLElement>('.title-char');
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
  }, []);

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

// ── Barra de filtros / ordenamiento ────────────────────────────
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
      {/* Buscador */}
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

      {/* Contador */}
      <span className="sort-bar__count" aria-live="polite">
        {total} video{total !== 1 ? 's' : ''}
      </span>

      {/* Ordenamiento */}
      <div className="sort-bar__options" role="group" aria-label="Ordenar por">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`sort-btn ${sort === opt.value ? 'sort-btn--active' : ''}`}
            onClick={() => onSort(opt.value)}
            aria-pressed={sort === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
function App() {
  const [sort, setSort] = useState<SortKey>('hype-desc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400); // espera 400ms tras el último teclazo
  const { theme, toggle } = useTheme();

  // El backend aplica sort y search — el hook solo pasa los params a la API
  const { data: videos, loading, error, refetch } = useVideos({ sort, search: debouncedSearch });

  const maxHype = videos.length > 0 ? Math.max(...videos.map((v) => v.hypeLevel)) : 0;
  // Con sort=hype-desc el primer video siempre es la Joya de la Corona
  const crownVideo = videos.find((v) => v.hypeLevel === maxHype) ?? null;
  const restVideos = videos.filter((v) => v !== crownVideo);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header" role="banner">
        <p className="header__eyebrow">Cartelera de conocimiento</p>
        <AnimatedTitle />
        <p className="header__subtitle">
          Videos tech rankeados por engagement real, no por views.
        </p>

        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ── Main ── */}
      <main className="main" id="main-content" role="main">

        {/* Estado: cargando */}
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

        {/* Estado: error */}
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

        {/* Estado: contenido cargado */}
        {!loading && !error && videos.length > 0 && (
          <>
            {/* Joya de la Corona */}
            {crownVideo && (
              <section className="crown-section" aria-labelledby="crown-heading">
                <div className="section-label crown-label" id="crown-heading">
                  Joya de la Corona
                </div>
                <CrownCard video={crownVideo} maxHype={maxHype} />
              </section>
            )}

            {/* Grid con sort/search */}
            <section className="grid-section" aria-labelledby="grid-heading">
              <div className="section-label" id="grid-heading">
                Todos los videos
                <span style={{ color: 'var(--text-tertiary)', fontFamily: 'Geist Mono, monospace', fontSize: '10px' }}>
                  {restVideos.length}
                </span>
              </div>

              <SortBar
                sort={sort}
                onSort={setSort}
                search={search}
                onSearch={setSearch}
                total={restVideos.length}
              />

              {restVideos.length > 0 ? (
                <div className="video-grid" role="list">
                  {restVideos.map((video, i) => (
                    <div key={video.id} role="listitem">
                      <VideoCard video={video} maxHype={maxHype} animationDelay={Math.min(i * 20, 60)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="error-state" style={{ minHeight: 160 }} role="status">
                  <p className="error-state__message">
                    Sin resultados para "<strong>{search}</strong>"
                  </p>
                  <button className="error-state__retry" onClick={() => setSearch('')}>
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* Estado: vacío */}
        {!loading && !error && videos.length === 0 && (
          <div className="error-state" role="status">
            <h2 className="error-state__title">Sin videos disponibles</h2>
            <p className="error-state__message">El backend no retornó ningún video.</p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer" role="contentinfo">
        HypeBoard &mdash; Prueba técnica &middot; NestJS + React
      </footer>
    </div>
  );
}

export default App;
