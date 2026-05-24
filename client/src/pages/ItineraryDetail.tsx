import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { trpc } from '../lib/trpc';

// ─── Types (mirrors AdminItineraries) ────────────────────────────────────────

interface ItineraryBlock {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  image?: string;
}

interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  daysRange: string;
  blocks: ItineraryBlock[];
  galleryImages: string[];
}

// ─── Gallery Strip ────────────────────────────────────────────────────────────

function GalleryStrip({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef<number | null>(null);
  const oneSectionWidth = useRef(0);

  const tripleImages = [...images, ...images, ...images];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    requestAnimationFrame(() => {
      const totalWidth = track.scrollWidth;
      oneSectionWidth.current = totalWidth / 3;
      track.scrollLeft = totalWidth / 3;
    });
  }, [images]);

  const checkLoop = () => {
    const track = trackRef.current;
    if (!track || oneSectionWidth.current === 0) return;
    const w = oneSectionWidth.current;
    if (track.scrollLeft >= w * 2) track.scrollLeft -= w;
    else if (track.scrollLeft <= 0) track.scrollLeft += w;
  };

  const cancelInertia = () => {
    if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; }
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocity.current *= 0.92;
      if (Math.abs(velocity.current) < 0.5) { velocity.current = 0; return; }
      track.scrollLeft -= velocity.current;
      checkLoop();
      rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeftStart.current = trackRef.current?.scrollLeft ?? 0;
    lastX.current = e.pageX;
    velocity.current = 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };
  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startX.current) * 1.0;
    velocity.current = e.pageX - lastX.current;
    lastX.current = e.pageX;
    if (trackRef.current) { trackRef.current.scrollLeft = scrollLeftStart.current - walk; }
  };

  const scrollBy = (delta: number) => {
    cancelInertia();
    const track = trackRef.current;
    if (!track) return;
    const target = track.scrollLeft + delta;
    const duration = 420;
    const start = track.scrollLeft;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animStep = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = start + (target - start) * ease(t);
      checkLoop();
      if (t < 1) rafId.current = requestAnimationFrame(animStep);
    };
    rafId.current = requestAnimationFrame(animStep);
  };

  if (images.length === 0) return null;

  const btnStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 20, flexShrink: 0, transition: 'background 0.2s',
  };

  return (
    <div style={{ width: '100%', background: '#222', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative', height: '280px' }}>
      <button style={{ ...btnStyle, left: '16px' }} onClick={() => scrollBy(-600)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}>
        <ChevronLeft size={20} color="white" strokeWidth={2} />
      </button>
      <div ref={trackRef} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'scroll', overflowY: 'hidden', width: '100%', height: '100%', paddingLeft: '56px', paddingRight: '56px', cursor: 'grab', userSelect: 'none', overscrollBehaviorX: 'none' } as React.CSSProperties}>
        {tripleImages.map((img, idx) => (
          <div key={idx} style={{ flexShrink: 0, height: '220px', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={img} alt="" draggable={false} style={{ height: '100%', width: 'auto', display: 'block', pointerEvents: 'none', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
      <button style={{ ...btnStyle, right: '16px' }} onClick={() => scrollBy(600)}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}>
        <ChevronRight size={20} color="white" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Image Carousel ───────────────────────────────────────────────────────────

const CURSOR_LEFT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='14' fill='rgba(0%2C0%2C0%2C0.45)'/%3E%3Cpolyline points='17%2C10 12%2C15 17%2C20' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 15 15, w-resize`;
const CURSOR_RIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='14' fill='rgba(0%2C0%2C0%2C0.45)'/%3E%3Cpolyline points='13%2C10 18%2C15 13%2C20' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 15 15, e-resize`;

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  const [mouseOnLeft, setMouseOnLeft] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animating, setAnimating] = useState(false);
  const [prev, setPrev] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!mouseInside || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const { x, y } = lastMousePos.current;
      if (!(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) setMouseInside(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mouseInside]);

  const navigate = (dir: 'next' | 'prev') => {
    if (animating || images.length <= 1) return;
    const nextIdx = dir === 'next' ? (current + 1) % images.length : (current - 1 + images.length) % images.length;
    setDirection(dir);
    setPrev(current);
    setCurrent(nextIdx);
    setAnimKey(k => k + 1);
    setAnimating(true);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 460);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setMouseInside(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouseOnLeft(e.clientX - rect.left < rect.width / 2);
  };

  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); navigate(mouseOnLeft ? 'prev' : 'next'); };
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { e.stopPropagation(); navigate(dx < 0 ? 'next' : 'prev'); }
  };

  const exitTo = direction === 'next' ? '-100%' : '100%';
  const enterFrom = direction === 'next' ? '100%' : '-100%';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: images.length > 1 ? (mouseInside ? (mouseOnLeft ? CURSOR_LEFT : CURSOR_RIGHT) : 'pointer') : 'default' }}
      onClick={handleClick} onMouseMove={handleMouseMove} onMouseLeave={() => setMouseInside(false)}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {prev !== null && (
        <img key={`prev-${animKey}`} src={images[prev]} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: `slideOut 460ms cubic-bezier(0.23,1,0.32,1) forwards`, ['--exit-to' as any]: exitTo }} />
      )}
      <img key={`curr-${animKey}`} src={images[current]} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: prev !== null ? `slideIn 460ms cubic-bezier(0.23,1,0.32,1) forwards` : 'none', ['--enter-from' as any]: enterFrom }} />
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10, pointerEvents: 'none' }}>
          {images.map((_, idx) => (
            <div key={idx} style={{ width: '7px', height: '7px', borderRadius: '50%', background: idx === current ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Similar Trips ────────────────────────────────────────────────────────────

function SimilarTripsSection({ currentSlug }: { currentSlug: string }) {
  const [, navigate] = useLocation();
  const { data: rawItineraries = [] } = trpc.cms.listItineraries.useQuery();
  const others = rawItineraries.filter(i => i.slug !== currentSlug).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <div style={{ background: '#fff', padding: '64px 40px' }}>
      <h2 style={{ fontFamily: 'sans-serif', fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', marginBottom: '32px', textAlign: 'center' }}>
        Similar Itineraries
      </h2>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {others.map(itin => (
          <div key={itin.id} style={{ width: '280px', cursor: 'pointer' }} onClick={() => navigate(`/itinerary/${itin.slug}`)}>
            <div style={{ height: '180px', background: '#eee', overflow: 'hidden', marginBottom: '12px' }}>
              {itin.coverImage && <img src={itin.coverImage} alt={itin.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            {itin.place && <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5569B', marginBottom: '4px' }}>{itin.place}</p>}
            <h3 style={{ fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', marginBottom: '8px' }}>{itin.name}</h3>
            {itin.shortDescription && <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{itin.shortDescription}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ItineraryDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [activeSection, setActiveSection] = useState('overview');
  const [stickyFixed, setStickyFixed] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const tripNavRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const { data: itin, isLoading, error } = trpc.cms.getItineraryBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const sections: ItinerarySection[] = Array.isArray(itin?.sections) ? (itin.sections as ItinerarySection[]) : [];
  const navSections = [
    { id: 'overview', label: 'OVERVIEW' },
    ...sections.map(s => ({ id: `section-${s.id}`, label: s.title.toUpperCase() || 'SECTION' })),
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;
      const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;
      if (currentY > heroHeight) {
        setStickyFixed(scrollingDown);
      } else {
        setStickyFixed(false);
      }
      lastScrollY.current = currentY;

      const navOffset = stickyFixed ? 48 : 0;
      const triggerY = currentY + navOffset + 60;
      let current = 'overview';
      navSections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top + currentY <= triggerY) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyFixed, navSections.length]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(id);
      const offset = stickyFixed ? 48 : 0;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navigation />
        <p style={{ fontSize: '14px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    );
  }

  if (error || !itin) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Navigation />
        <p style={{ fontSize: '14px', color: '#888' }}>Itinerary not found.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
      <style>{`
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(var(--exit-to)); }
        }
        @keyframes slideIn {
          from { transform: translateX(var(--enter-from)); }
          to { transform: translateX(0); }
        }
        .gallery-track::-webkit-scrollbar { display: none; }
        .gallery-track { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navigation forceHide={stickyFixed} />

      {/* ── HERO BANNER ── */}
      <div ref={heroRef} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {itin.bannerImage ? (
          <img src={itin.bannerImage} alt={itin.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          {itin.place && (
            <p style={{ fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '16px', fontFamily: 'sans-serif' }}>
              {itin.place}
            </p>
          )}
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '0.02em', maxWidth: '800px', marginBottom: '20px' }}>
            {itin.name}
          </h1>
          {itin.shortDescription && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px, 2vw, 18px)', fontStyle: 'italic', maxWidth: '560px', lineHeight: 1.6 }}>
              {itin.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* ── STICKY SECTION NAV ── */}
      <div ref={tripNavRef} style={{ height: '48px', position: 'relative', zIndex: 39 }}>
        <div style={{ position: stickyFixed ? 'fixed' : 'relative', top: stickyFixed ? 0 : 'auto', left: 0, right: 0, zIndex: 39, background: 'rgba(245,245,245,0.97)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', overflowX: 'auto' }}>
            {navSections.map(s => (
              <button key={s.id} onClick={() => scrollToSection(s.id)}
                style={{ position: 'relative', padding: '12px 20px', fontSize: 'clamp(8px, 2vw, 12px)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', color: activeSection === s.id ? '#111' : '#888', borderBottom: activeSection === s.id ? '2px solid #111' : '2px solid transparent', transition: 'color 0.2s' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      <div id="overview" style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px', textAlign: 'center', scrollMarginTop: '60px' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 300, lineHeight: 1.2, marginBottom: '32px', color: '#1a1a1a' }}>
          {itin.overviewTitle || itin.name}
        </h2>
        {itin.description && (
          <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.8, fontFamily: 'Georgia, serif', marginBottom: '48px' }}>
            {itin.description}
          </p>
        )}

        {/* WHEN / PRICE / HOW LONG */}
        {(itin.when || itin.price || itin.howLong) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
            {itin.when && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f49e0b', marginBottom: '10px', fontFamily: 'sans-serif' }}>WHEN</p>
                <p style={{ fontStyle: 'italic', fontSize: '15px', color: '#6B6B6B', lineHeight: 1.5 }}>{itin.when}</p>
              </div>
            )}
            {itin.price && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1d902b', marginBottom: '10px', fontFamily: 'sans-serif' }}>PRICE</p>
                <p style={{ fontStyle: 'italic', fontSize: '15px', color: '#6B6B6B', lineHeight: 1.5 }}>{itin.price}</p>
              </div>
            )}
            {itin.howLong && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2c6faa', marginBottom: '10px', fontFamily: 'sans-serif' }}>HOW LONG</p>
                <p style={{ fontStyle: 'italic', fontSize: '15px', color: '#6B6B6B', lineHeight: 1.5 }}>{itin.howLong}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ITINERARY SECTIONS ── */}
      {sections.map((section, si) => (
        <React.Fragment key={section.id}>
          <div id={`section-${section.id}`} style={{ backgroundColor: '#ededed', position: 'relative', scrollMarginTop: '60px' }}>
            <div style={{ display: 'flex', padding: '0 24px 0 0', maxWidth: '1100px', margin: '0 auto' }}>
              {/* Left: timeline */}
              <div style={{ width: '55px', flexShrink: 0, position: 'relative', alignSelf: 'stretch' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: 'repeating-linear-gradient(to bottom, #52b788 0px, #52b788 3px, transparent 3px, transparent 5px)', transform: 'translateX(-50%)', zIndex: 0 }} />
                {section.blocks.map((_, i) => {
                  const HEADER = 210, GAP = 50;
                  let topOffset = HEADER;
                  for (let j = 0; j < i; j++) topOffset += (j % 2 === 0 ? 480 : 510) + GAP;
                  return (
                    <div key={i} style={{ position: 'absolute', left: '20px', top: `${topOffset + 40}px`, width: '15px', height: '15px', borderRadius: '50%', background: '#52b788', zIndex: 3, transform: 'translateX(-50%)', pointerEvents: 'none' }} />
                  );
                })}
              </div>

              {/* Right: content */}
              <div style={{ flex: 1, minWidth: 0, maxWidth: '964px' }}>
                {/* Section header */}
                <div style={{ paddingTop: '64px', paddingBottom: '32px' }}>
                  <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'sans-serif', marginBottom: '16px', color: '#1a1a1a' }}>
                    {section.title}
                  </h2>
                  {section.description && (
                    <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.75, fontFamily: 'Georgia, serif', maxWidth: '640px' }}>
                      {section.description}
                    </p>
                  )}
                  {section.daysRange && (
                    <p style={{ marginTop: '16px', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'sans-serif', color: '#2d6a4f' }}>
                      {section.daysRange}
                    </p>
                  )}
                </div>

                {/* Day cards */}
                <div style={{ paddingBottom: '64px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                    {section.blocks.map((block, i) => {
                      const imageLeft = i % 2 === 1;
                      const cardHeight = i % 2 === 0 ? '480px' : '510px';
                      const images = block.image ? [block.image] : [];
                      return (
                        <div key={block.id}>
                          <div style={{ display: 'flex', flexDirection: imageLeft ? 'row' : 'row-reverse', width: '100%', maxWidth: '964px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '4px 4px 16px rgba(0,0,0,0.13)', height: cardHeight }}>
                            {/* Image side */}
                            {images.length > 0 ? (
                              <div style={{ width: '45%', flexShrink: 0, overflow: 'hidden' }}>
                                <ImageCarousel images={images} alt={block.title} />
                              </div>
                            ) : (
                              <div style={{ width: '45%', flexShrink: 0, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#aaa', letterSpacing: '0.1em' }}>No Image</span>
                              </div>
                            )}
                            {/* Text side */}
                            <div style={{ flex: 1, padding: '40px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'hidden' }}>
                              <p style={{ fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '0.15em', color: '#2d6a4f', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                                DAY {block.dayNumber}
                              </p>
                              <h3 style={{ fontFamily: 'sans-serif', fontSize: 'clamp(15px, 1.8vw, 21px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '18px', lineHeight: 1.2, color: '#111' }}>
                                {block.title}
                              </h3>
                              <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#555', lineHeight: 1.75 }}>
                                {block.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery strip after each section */}
          {section.galleryImages.length > 0 && (
            <GalleryStrip images={section.galleryImages} />
          )}
        </React.Fragment>
      ))}

      {/* ── SIMILAR TRIPS ── */}
      <SimilarTripsSection currentSlug={slug!} />

      {/* ── ENQUIRE CTA ── */}
      <section style={{ position: 'relative', width: '100%', height: 'clamp(260px, 30vw, 275px)', backgroundColor: '#a84900', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/manus-storage/texture-buried_038ce46e.png)', backgroundSize: '400px 400px', backgroundRepeat: 'repeat', opacity: 0.65, mixBlendMode: 'multiply' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
            Ready to start your journey?
          </h2>
          <a href="/make-an-enquiry">
            <button style={{ padding: '14px 40px', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'sans-serif', transition: 'background 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}>
              Enquire Now
            </button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
