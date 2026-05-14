import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { LayoutProps, SortKey } from '../types';
import { YouTubeCard, YouTubeSkeletonCard } from './YouTubeCard';
import './youtube.css';

const SORT_CHIPS: { value: SortKey; label: string }[] = [
  { value: 'hype-desc', label: 'Todos' },
  { value: 'date-desc', label: 'Novedades' },
  { value: 'title-asc', label: 'Programación' },
  { value: 'hype-asc',  label: 'Menos vistos' },
  { value: 'date-asc',  label: 'Clásicos' },
];

export function YouTubeLayout({
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
  onStyleChange
}: LayoutProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;
    gsap.fromTo(
      logoRef.current,
      { x: -20, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  const handleStyleToggle = () => {
    // Switch back to minimalist
    onStyleChange('minimalist');
  };

  if (error) {
    return (
      <div className="yt-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--yt-bg)' }}>
        <header className="yt-header" style={{ position: 'static' }}>
          <div className="yt-header-left">
            <button className="yt-icon-btn" onClick={() => onStyleChange('minimalist')}>
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z"></path></svg>
            </button>
            <div className="yt-logo" onClick={() => onStyleChange('minimalist')} style={{ cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-0.5px', color: 'var(--yt-red)' }}>HypeTube</span>
            </div>
          </div>
        </header>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="var(--yt-text-secondary)" style={{ opacity: 0.5, marginBottom: '20px' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--yt-text)' }}>Algo salió mal</h2>
          <p style={{ color: 'var(--yt-text-secondary)', marginBottom: '25px', maxWidth: '400px' }}>
            No pudimos conectar con los servidores. Revisa tu conexión a internet.
          </p>
          <button 
            onClick={refetch}
            style={{ padding: '10px 24px', borderRadius: '18px', background: '#065fd4', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`yt-layout ${theme === 'dark' ? 'yt-dark' : 'yt-light'}`}>
      
      {/* ── Top Navbar ── */}
      <nav className="yt-navbar">
        <div className="yt-navbar__left">
          <button className="yt-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menú">
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z"></path></svg>
          </button>
          <div className="yt-logo" ref={logoRef} onClick={handleStyleToggle} title="Volver a Minimalist" style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 90 20" width="90" height="20">
              <path fill="#FF0000" d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"></path>
              <path fill="#FFFFFF" d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"></path>
            </svg>
            <span className="yt-logo-text">HypeTube</span>
          </div>
        </div>

        <div className="yt-navbar__center">
          <form className="yt-searchbox" onSubmit={handleSearchSubmit}>
            <div className="yt-searchbox__input-wrapper">
              <input 
                type="text" 
                placeholder="Buscar" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="yt-searchbox__btn" aria-label="Buscar">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.87,20.17l-5.59-5.59C16.35,13.35,17,11.75,17,10c0-3.87-3.13-7-7-7s-7,3.13-7,7s3.13,7,7,7c1.75,0,3.35-0.65,4.58-1.71 l5.59,5.59L20.87,20.17z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S13.31,16,10,16z"></path></svg>
            </button>
          </form>
          <button className="yt-mic-btn" aria-label="Búsqueda por voz">
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-1.66 0-3 1.34-3 3v6c0 1.66 1.34 3 3 3s3-1.34 3-3V6c0-1.66-1.34-3-3-3zm5.88 8.87l-1.04-.15c-.21.84-.66 1.58-1.29 2.15-1.31 1.2-3.36 1.34-4.88.22-.55-.41-1-1.01-1.25-1.7l-1.05.15c.32.9 1.01 1.69 1.83 2.21 1.25.79 2.82.89 4.14.31 1.33-.58 2.3-1.84 2.54-3.19zM12 21c-3.86 0-7-3.14-7-7h2c0 2.76 2.24 5 5 5s5-2.24 5-5h2c0 3.86-3.14 7-7 7z"></path></svg>
          </button>
        </div>

        <div className="yt-navbar__right" style={{ gap: '16px' }}>
          {/* Opciones de tema estructural */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="yt-chip" 
              onClick={() => onStyleChange('minimalist')}
              title="Ir a Minimalist"
              style={{ height: '36px', background: 'transparent', border: '1px solid var(--yt-border)' }}
            >
              ✦ Minimalist
            </button>
            <button 
              className="yt-chip active" 
              title="Estás en YouTube"
              style={{ height: '36px' }}
            >
              ▶ YouTube
            </button>
            <button 
              className="yt-chip" 
              onClick={() => onStyleChange('netflix')}
              title="Ir a Netflix"
              style={{ height: '36px', background: 'transparent', border: '1px solid var(--yt-border)' }}
            >
              🎬 Netflix
            </button>
          </div>

          <button className="yt-icon-btn" onClick={toggleTheme} title="Cambiar tema claro/oscuro">
            {theme === 'dark' ? (
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-1-14h2v3h-2zm0 10h2v3h-2zm9-5v2h-3v-2zM6 11v2H3v-2zm10.24-5.35l1.42 1.42-2.12 2.12-1.42-1.42zM5.65 16.93l1.42 1.42-2.12 2.12-1.42-1.42zM16.93 18.35l1.42-1.42 2.12 2.12-1.42 1.42zM7.07 5.65l2.12 2.12-1.42 1.42-2.12-2.12z"></path></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"></path></svg>
            )}
          </button>
          <button className="yt-icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm10-2.65V19H4v-1.65l2-1.88v-5.15C6 7.4 7.56 5.1 10 4.34v-.38c0-1.42 1.49-2.5 2.99-1.76.65.32 1.01 1.03 1.01 1.76v.39c2.44.75 4 3.06 4 5.98v5.15l2 1.87zM12 5.5c-2.48 0-4.5 2.02-4.5 4.5v6.5l-1 1h11l-1-1v-6.5c0-2.48-2.02-4.5-4.5-4.5z"></path></svg>
          </button>
          <div className="yt-avatar">A</div>
        </div>
      </nav>

      <div className="yt-body">
        {/* ── Sidebar ── */}
        <aside className={`yt-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="yt-sidebar__section">
            <button className="yt-sidebar__item active">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z"></path></svg>
              <span>Inicio</span>
            </button>
            <button className="yt-sidebar__item">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L19 8.6c.76-.35 1.07-1.27.7-2.03-.38-.76-1.32-1.07-2.08-.7L5.34 11.5c-.76.35-1.07 1.27-.7 2.04.38.75 1.32 1.06 2.08.69l1.23-.55s.43-.18 1.2.13l-2.43 1.22c-.76.35-1.07 1.27-.7 2.03.38.76 1.32 1.07 2.08.7l12.28-5.63c.76-.35 1.07-1.27.7-2.03-.38-.76-1.32-1.07-2.08-.71z"></path></svg>
              <span>Shorts</span>
            </button>
            <button className="yt-sidebar__item">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20 7H4V6h16v1zm2 2v12H2V9h20zm-7 6l-5-2.77v5.54L15 15zM17 4H7V3h10v1z"></path></svg>
              <span>Suscripciones</span>
            </button>
          </div>
          <div className="yt-sidebar__divider"></div>
          <div className="yt-sidebar__section">
            <button className="yt-sidebar__item">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 7l6 3.5L11 14V7zm7 13H4V6H3v15h15v-1zm3-2H6V3h15v15zM7 17h13V4H7v13z"></path></svg>
              <span>Tú</span>
            </button>
            <button className="yt-sidebar__item">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.51-4.49 10-10 10S2 17.51 2 12h1c0 4.96 4.04 9 9 9s9-4.04 9-9-4.04-9-9-9C8.81 3 5.92 4.64 4.28 7.38c-.11.18-.22.37-.31.56L3.94 8H8v1H1.96V3h1v4.74c.04-.09.07-.17.11-.25.11-.22.23-.42.35-.63C5.22 3.86 8.51 2 12 2c5.51 0 10 4.49 10 10z"></path></svg>
              <span>Historial</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="yt-main">
          
          {/* Chips Bar */}
          <div className="yt-chips">
            {SORT_CHIPS.map(chip => (
              <button 
                key={chip.value}
                className={`yt-chip ${sort === chip.value ? 'active' : ''}`}
                onClick={() => onSort(chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="yt-content">
            {loading && (
              <div className="yt-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <YouTubeSkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && !error && videos.length > 0 && (
              <div className="yt-grid">
                {videos.map((video, index) => (
                  <YouTubeCard 
                    key={`${video.id}-yt`} 
                    video={video} 
                    rank={index + 1} 
                    animationDelay={Math.min(index * 25, 150)}
                  />
                ))}
              </div>
            )}

            {!loading && !error && videos.length === 0 && (
              <div className="yt-empty">
                <h3>No hay resultados</h3>
                <p>Prueba con otras palabras clave.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
