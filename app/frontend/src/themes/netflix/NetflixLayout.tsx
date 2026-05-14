import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { LayoutProps } from '../types';
import './netflix.css';

export function NetflixLayout({
  videos,
  loading,
  error,
  onStyleChange,
  theme,
  toggleTheme,
  search,
  onSearch,
}: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Navbar Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Search Outside Click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        if (!localSearch) setSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [localSearch]);

  // Entrance Animations
  useEffect(() => {
    if (loading || videos.length === 0) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.nf-hero__content > *', {
        y: 30,
        autoAlpha: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out'
      });
      gsap.from('.nf-card', {
        scale: 0.9,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.4
      });
    });
    return () => ctx.revert();
  }, [loading, videos.length]);

  const getCorrectedUrl = (url: string) => url.replace('https://via.placeholder.com', 'https://placehold.co');

  const maxHype = videos.length > 0 ? Math.max(...videos.map(v => v.hypeLevel)) : 0;
  const heroVideo = videos.find(v => v.hypeLevel === maxHype) || videos[0];
  const restVideos = videos.filter(v => v.id !== (heroVideo?.id || ''));

  if (loading) {
    return (
      <div className="netflix-layout">
        <nav className="nf-nav nf-nav--scrolled">
          <div className="nf-logo">HYPEFLIX</div>
        </nav>
        <div className="nf-skeleton-hero" />
        <div className="nf-main">
          <div className="nf-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="nf-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="netflix-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <nav className="nf-nav nf-nav--scrolled">
          <div className="nf-logo" onClick={() => onStyleChange('minimalist')}>HYPEFLIX</div>
        </nav>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--nf-red)" strokeWidth="2" style={{ marginBottom: '20px', display: 'inline-block' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>¿Quiénes somos? ¿A dónde vamos?</h2>
          <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.5' }}>
            No pudimos conectar con los servidores de HypeBoard. Asegúrate de que tu backend esté corriendo y revisa tu conexión.
          </p>
          <button className="nf-btn nf-btn--white" onClick={refetch} style={{ margin: '0 auto' }}>
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="netflix-layout">
      {/* ── Navbar ── */}
      <nav className={`nf-nav ${scrolled ? 'nf-nav--scrolled' : ''}`}>
        <div className="nf-logo" onClick={() => onStyleChange('minimalist')}>HYPEFLIX</div>
        
        <ul className="nf-nav__links">
          <li className="nf-nav__link" onClick={() => onStyleChange('minimalist')}>Inicio</li>
          <li className="nf-nav__link" onClick={() => onStyleChange('youtube')}>YouTube Mode</li>
          <li className="nf-nav__link" onClick={() => onStyleChange('cyberpunk')}>Cyberpunk</li>
          <li className="nf-nav__link nf-nav__link--active">Netflix Original</li>
        </ul>

        <div className="nf-nav__right">
          {/* Search Box */}
          <div 
            ref={searchRef}
            className={`nf-search-container ${searchActive ? 'nf-search-container--active' : ''}`}
            onClick={() => {
              setSearchActive(true);
              inputRef.current?.focus();
            }}
          >
            <button className="nf-icon-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <input 
              ref={inputRef}
              className="nf-search-input"
              type="text"
              placeholder="Títulos, autores..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearch(e.target.value);
              }}
            />
          </div>

          <button className="nf-icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> 
              : 
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          
          <div className="yt-avatar" style={{ background: 'var(--nf-red)', borderRadius: '2px', width: '32px', height: '32px' }}>J</div>
        </div>
      </nav>

      {/* ── Billboard / Hero ── */}
      {heroVideo && (
        <header className="nf-hero">
          <img className="nf-hero__image" src={getCorrectedUrl(heroVideo.thumbnail)} alt={heroVideo.title} />
          <div className="nf-hero__vignette" />
          <div className="nf-hero__bottom-vignette" />
          
          <div className="nf-hero__content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: 'var(--nf-red)', fontWeight: '900', fontSize: '1.5rem' }}>N</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', color: '#aaa' }}>SERIE</span>
            </div>
            <h1 className="nf-hero__title">{heroVideo.title}</h1>
            <p className="nf-hero__author" style={{ color: '#e5e5e5', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>
              De {heroVideo.author}
            </p>
            <p className="nf-hero__desc">
              Un video excepcional con un índice de hype de {heroVideo.hypeLevel.toFixed(3)}. 
              Explora las últimas tendencias tecnológicas en esta producción original de HypeBoard.
            </p>
            <div className="nf-hero__btns">
              <button className="nf-btn nf-btn--white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Reproducir
              </button>
              <button className="nf-btn nf-btn--grey">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Más información
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Main Content ── */}
      <main className="nf-main">
        <section className="nf-row">
          <h2 className="nf-row__title">Tendencias ahora</h2>
          <div className="nf-grid">
            {restVideos.map((v) => (
              <div className="nf-card" key={v.id}>
                <img className="nf-card__img" src={getCorrectedUrl(v.thumbnail)} alt={v.title} />
                <div className="nf-card__progress" style={{ width: `${(v.hypeLevel * 100).toFixed(0)}%` }} />
                <div className="nf-card__info">
                  <h3 className="nf-card__title">{v.title}</h3>
                  <p className="nf-card__author" style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '4px' }}>{v.author}</p>
                  <div className="nf-card__meta">
                    {Math.floor(v.hypeLevel * 100) + 70}% de coincidencia
                    <span>{v.publishedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
