import './index.css';
import { useState, useEffect } from 'react';
import { useVideos } from './hooks/useVideos';
import { VideoCard, SkeletonCard } from './components/VideoCard';

// ── Iconos SVG inline (sin librería externa) ───────────────────
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

  // Activa la transición CSS solo después del primer render
  // para evitar el flash de tema al cargar la página
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.body.classList.add('theme-ready');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

// ── App ────────────────────────────────────────────────────────
function App() {
  const { theme, toggle } = useTheme();
  const { data: videos, loading, error, refetch } = useVideos();

  const maxHype = videos.length > 0 ? Math.max(...videos.map((v) => v.hypeLevel)) : 0;
  const crownVideo = videos.find((v) => v.hypeLevel === maxHype) ?? null;
  const restVideos = videos.filter((v) => v !== crownVideo);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header" role="banner">
        <p className="header__eyebrow">Cartelera de conocimiento</p>
        <h1 className="header__title">HypeBoard</h1>
        <p className="header__subtitle">
          Videos tech rankeados por engagement real, no por views.
        </p>

        {/* Toggle dark / light */}
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
                <VideoCard
                  video={crownVideo}
                  maxHype={maxHype}
                  isCrown
                  animationDelay={0}
                />
              </section>
            )}

            {/* Grid */}
            <section className="grid-section" aria-labelledby="grid-heading">
              <div className="section-label" id="grid-heading">
                Todos los videos
                <span style={{ color: 'var(--text-tertiary)', fontFamily: 'Geist Mono, monospace', fontSize: '10px' }}>
                  {restVideos.length}
                </span>
              </div>
              <div className="video-grid" role="list">
                {restVideos.map((video, i) => (
                  <div key={video.id} role="listitem">
                    <VideoCard
                      video={video}
                      maxHype={maxHype}
                      animationDelay={i * 35}
                    />
                  </div>
                ))}
              </div>
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
