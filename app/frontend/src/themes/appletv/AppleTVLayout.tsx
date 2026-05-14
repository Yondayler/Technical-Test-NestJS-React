import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { LayoutProps } from '../types';
import './appletv.css';

export function AppleTVLayout({
  videos,
  loading,
  error,
  refetch,
  onStyleChange,
  theme,
  toggleTheme,
  search,
  onSearch,
}: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(!!search);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const trendingRowRef = useRef<HTMLDivElement>(null);
  const editorRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search is activated
  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  useEffect(() => {
    if (loading || videos.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from('.atv-hero__content > *', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power4.out',
      });
    });
    return () => ctx.revert();
  }, [loading, videos.length]);

  const getCorrectedUrl = (url: string) => {
    if (!url) return '';
    // Fix common placeholder issues
    return url.replace('https://via.placeholder.com', 'https://placehold.co');
  };

  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const featuredVideo = videos.length > 0 ? [...videos].sort((a, b) => b.hypeLevel - a.hypeLevel)[0] : null;
  const trendingVideos = [...videos].sort((a, b) => b.hypeLevel - a.hypeLevel).slice(1, 12);
  const editorChoice = [...videos].slice(Math.max(0, videos.length - 8));

  return (
    <div className={`appletv-layout ${theme === 'dark' ? 'atv-dark' : 'atv-light'}`}>
      <nav className={`atv-nav ${scrolled ? 'atv-nav--scrolled' : ''}`}>
        <div className="atv-nav__brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          HypeTV+
        </div>

        <ul className="atv-nav__list">
          <li className="atv-nav__item atv-nav__item--active">Explorar</li>
          <li className="atv-nav__item" onClick={() => onStyleChange('netflix')}>Netflix</li>
          <li className="atv-nav__item" onClick={() => onStyleChange('youtube')}>YouTube</li>
          <li className="atv-nav__item" onClick={() => onStyleChange('minimalist')}>Minimalist</li>
          <li className="atv-nav__item" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </li>
        </ul>

        <div className={`atv-search-box ${searchActive ? 'active' : ''}`}>
          <button 
            className="atv-search-toggle" 
            onClick={() => setSearchActive(!searchActive)}
            aria-label="Buscar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <input 
            ref={searchInputRef}
            type="text" 
            className="atv-search-input" 
            placeholder="Buscar..." 
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onBlur={() => { if(!search) setSearchActive(false); }}
          />
        </div>
      </nav>

      {featuredVideo && !search && (
        <header className="atv-hero">
          <div className="atv-hero__bg">
            <img 
              className="atv-hero__image" 
              src={getCorrectedUrl(featuredVideo.thumbnail)} 
              alt={featuredVideo.title}
              onError={(e) => {
                // Fallback si falla la carga
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="atv-hero__overlay" />
          </div>
          <div className="atv-hero__content">
            <h1 className="atv-hero__title">{featuredVideo.title}</h1>
            <p className="atv-hero__desc">
              Experimenta el mayor nivel de hype. Una producción de {featuredVideo.author} que está rompiendo récords.
            </p>
            <div className="atv-btn-group">
              <button className="atv-btn atv-btn--primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Reproducir
              </button>
              <button className="atv-btn atv-btn--glass">Más información</button>
            </div>
          </div>
        </header>
      )}

      <main className="atv-main" style={{ marginTop: (search || !featuredVideo || error) ? '100px' : '0' }}>
        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📡</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>Conexión interrumpida</h2>
            <p style={{ color: 'var(--atv-text-secondary)', marginBottom: '32px', maxWidth: '450px', lineHeight: '1.6' }}>
              No pudimos conectar con los servidores de Apple. Revisa tu conexión a internet o asegúrate de que el backend esté activo.
            </p>
            <button className="atv-btn atv-btn--primary" onClick={refetch}>
              Reintentar conexión
            </button>
          </div>
        )}

        {loading && !error && (
          <section className="atv-section" style={{ paddingTop: '40px' }}>
            <div className="atv-hero atv-skeleton" style={{ width: '90%', height: '400px', borderRadius: '24px', opacity: 0.1 }} />
          </section>
        )}

        {!search && !error && !loading && (
          <section className="atv-section">
            <div className="atv-section__header">
              <h2 className="atv-section__title">Tendencias mundiales</h2>
              <div className="atv-scroll-controls">
                <button className="atv-scroll-btn" onClick={() => scrollRow(trendingRowRef, 'left')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button className="atv-scroll-btn" onClick={() => scrollRow(trendingRowRef, 'right')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
            <div className="atv-row" ref={trendingRowRef}>
              {trendingVideos.map((v) => (
                <div key={v.id} className="atv-card">
                  <div className="atv-card__wrapper">
                    <img className="atv-card__img" src={getCorrectedUrl(v.thumbnail)} alt={v.title} />
                  </div>
                  <div className="atv-card__info">
                    <h3 className="atv-card__title">{v.title}</h3>
                    <div className="atv-card__meta">{v.author} • {Math.round(v.hypeLevel * 100)}% Hype</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!search && !error && !loading && (
          <section className="atv-section">
            <div className="atv-section__header">
              <h2 className="atv-section__title">Selección del Editor</h2>
              <div className="atv-scroll-controls">
                <button className="atv-scroll-btn" onClick={() => scrollRow(editorRowRef, 'left')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button className="atv-scroll-btn" onClick={() => scrollRow(editorRowRef, 'right')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
            <div className="atv-row" ref={editorRowRef}>
              {editorChoice.map((v) => (
                <div key={v.id} className="atv-card atv-card--vertical">
                  <div className="atv-card__wrapper">
                    <img className="atv-card__img" src={getCorrectedUrl(v.thumbnail)} alt={v.title} />
                  </div>
                  <div className="atv-card__info">
                    <h3 className="atv-card__title">{v.title}</h3>
                    <div className="atv-card__meta">{v.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección de Catálogo Completo (Siempre visible al final) */}
        {!error && !loading && (
          <section className="atv-section">
            <div className="atv-section__header">
              <h2 className="atv-section__title">
                {search ? `Resultados para "${search}"` : "Explora todo el catálogo"}
              </h2>
            </div>
            <div className="atv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', paddingRight: '5%', marginTop: '20px' }}>
              {videos.map((v) => (
                <div key={v.id} className="atv-card" style={{ width: '100%' }}>
                  <div className="atv-card__wrapper">
                    <img className="atv-card__img" src={getCorrectedUrl(v.thumbnail)} alt={v.title} />
                  </div>
                  <div className="atv-card__info">
                    <h3 className="atv-card__title">{v.title}</h3>
                    <div className="atv-card__meta">{v.author}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {videos.length === 0 && !loading && !error && (
              <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
                <h3>No hay resultados</h3>
                <p>Intenta con otros términos de búsqueda.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
