/*
 * ExperienceDetail — Dynamic experience detail page
 * Uses TeaMountains template layout, data from database via tRPC
 * Route: /experiences/:categorySlug/:id  (id = slug)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import BackgroundImageContainer from '@/components/BackgroundImageContainer';

// ── Helper to convert type name to slug ──────────────────────────────────────
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Infinite carousel ──────────────────────────────────────────────────────────
const FIXED_HEIGHT_VW = 70 * 0.65; // 45.5vw
const FIXED_HEIGHT_MAX = 720; // px
const GAP_PX = 0;

function HeroCarousel({ images }: { images: string[] }) {
  const extended = [images[images.length - 1], ...images, images[0]];
  const [internalIdx, setInternalIdx] = useState(1);
  const idxRef = useRef(1);
  const setIdx = useCallback((v: number) => { idxRef.current = v; setInternalIdx(v); }, []);
  const [animated, setAnimated] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isJumping = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Store image dimensions: [{ width, height }, ...]
  const [imageDims, setImageDims] = useState<Array<{ width: number; height: number }>>([]);
  const [containerWidth, setContainerWidth] = useState(0);

  const activeSlide = (internalIdx - 1 + images.length) % images.length;

  // Calculate card widths based on image aspect ratios
  const fixedHeightPx = typeof window !== 'undefined' ? Math.min(window.innerWidth * (FIXED_HEIGHT_VW / 100), FIXED_HEIGHT_MAX) : FIXED_HEIGHT_MAX;
  const cardWidths = imageDims.length === extended.length ? imageDims.map(dim => {
    if (!dim.width || !dim.height) return 0;
    const aspectRatio = dim.width / dim.height;
    return fixedHeightPx * aspectRatio;
  }) : new Array(extended.length).fill(0);

  // Calculate cumulative widths for translateX
  const cumulativeWidths = new Array(extended.length).fill(0).map((_, i) => {
    return cardWidths.slice(0, i).reduce((sum, w) => sum + w, 0);
  });

  // Calculate translateX to center active card
  const getTranslateX = () => {
    if (cardWidths.length === 0 || containerWidth === 0) return 0;
    const activeCardWidth = cardWidths[internalIdx];
    const offsetToActive = cumulativeWidths[internalIdx] || 0;
    const centerOffset = (containerWidth / 2) - (activeCardWidth / 2);
    return -(offsetToActive) + centerOffset + dragOffset;
  };

  // Load image dimensions
  useEffect(() => {
    const dims: Array<{ width: number; height: number }> = [];
    let loaded = 0;
    
    extended.forEach((src, idx) => {
      const img = new Image();
      img.onload = () => {
        dims[idx] = { width: img.naturalWidth, height: img.naturalHeight };
        loaded++;
        if (loaded === extended.length) {
          setImageDims([...dims]);
        }
      };
      img.onerror = () => {
        dims[idx] = { width: 16, height: 9 }; // fallback to 16:9
        loaded++;
        if (loaded === extended.length) {
          setImageDims([...dims]);
        }
      };
      img.src = src;
    });
  }, [extended]);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (isJumping.current) return;
    const cur = idxRef.current;
    let jumpTo: number | null = null;
    // Jump when reaching the first copy (index 0)
    if (cur === 0) {
      jumpTo = images.length;
    }
    // Jump when reaching the last copy (index = extended.length - 1)
    else if (cur === extended.length - 1) {
      jumpTo = 1;
    }
    if (jumpTo === null) return;
    isJumping.current = true;
    setAnimated(false);
    setIdx(jumpTo);
    requestAnimationFrame(() => requestAnimationFrame(() => { setAnimated(true); isJumping.current = false; }));
  }, [setIdx, images.length, extended.length]);

  const prevSlide = useCallback(() => setIdx(idxRef.current - 1), [setIdx]);
  const nextSlide = useCallback(() => setIdx(idxRef.current + 1), [setIdx]);

  const onDragStart = (clientX: number) => { isDragging.current = true; startX.current = clientX; setDragOffset(0); };
  const onDragMove  = (clientX: number) => { if (!isDragging.current) return; setDragOffset(clientX - startX.current); };
  const onDragEnd   = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset < -60) nextSlide();
    else if (dragOffset > 60) prevSlide();
    setDragOffset(0);
  };

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div style={{ background: '#fff', padding: '0 0 48px' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ width: 'auto', margin: '0 auto', maxHeight: FIXED_HEIGHT_MAX, aspectRatio: '16/9' }}>
            <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '0 0 48px', position: 'relative', userSelect: 'none' }}>
      <div
        ref={containerRef}
        style={{ overflow: 'hidden', position: 'relative', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={e => onDragStart(e.clientX)}
        onMouseMove={e => onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={e => onDragStart(e.touches[0].clientX)}
        onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
        onTouchEnd={onDragEnd}
      >
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            display: 'flex',
            transition: (!animated || isDragging.current) ? 'none' : 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            transform: `translateX(${getTranslateX()}px)`,
          }}
        >
          {extended.map((src, i) => {
            const isActive = i === internalIdx;
            const cardWidth = cardWidths[i] || 0;
            return (
              <div
                key={i}
                style={{
                  flexShrink: 0, width: `${cardWidth}px`, height: `${fixedHeightPx}px`, maxHeight: FIXED_HEIGHT_MAX,
                  marginRight: `${GAP_PX}px`, transition: 'opacity 0.4s', opacity: isActive ? 1 : 0.4,
                  overflow: 'hidden', pointerEvents: isActive ? 'none' : 'auto', cursor: isActive ? 'default' : 'pointer',
                }}
                onClick={() => { if (!isActive) { if (i < internalIdx) prevSlide(); else nextSlide(); } }}
              >
                <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => setIdx(i + 1)}
            style={{ width: i === activeSlide ? 20 : 6, height: 6, borderRadius: 3, background: i === activeSlide ? '#1a1a1a' : '#ccc', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
          />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={prevSlide} aria-label="Previous" style={{ position: 'absolute', left: 'clamp(8px, 2vw, 32px)', top: '40%', transform: 'translateY(-50%)', background: 'rgba(90,90,90,0.85)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', zIndex: 2 }}>‹</button>
      <button onClick={nextSlide} aria-label="Next"     style={{ position: 'absolute', right: 'clamp(8px, 2vw, 32px)', top: '40%', transform: 'translateY(-50%)', background: 'rgba(90,90,90,0.85)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', zIndex: 2 }}>›</button>
    </div>
  );
}

// ── Similar Experiences Carousel ───────────────────────────────────────────────
function SimilarCarousel({ items, bgImage }: { items: any[]; bgImage: string }) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startXRef = useRef(0);
  const scrollStart = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const rafRef = useRef<number | null>(null);

  const cancelInertia = () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  const updateBtns = () => {
    const t = trackRef.current; if (!t) return;
    setShowLeft(t.scrollLeft > 0);
    setShowRight(t.scrollLeft < t.scrollWidth - t.clientWidth - 10);
  };
  const startInertia = () => {
    const t = trackRef.current; if (!t) return;
    const step = () => {
      velocity.current *= 0.92;
      if (Math.abs(velocity.current) < 0.5) { velocity.current = 0; updateBtns(); return; }
      t.scrollLeft -= velocity.current; updateBtns();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };
  const scrollBy = (delta: number) => {
    cancelInertia();
    const t = trackRef.current; if (!t) return;
    const start = t.scrollLeft, target = start + delta, duration = 420, startTime = performance.now();
    const ease = (x: number) => x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    const step = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      t.scrollLeft = start + (target - start) * ease(p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const t = trackRef.current; if (!t) return;
    updateBtns();
    t.addEventListener('scroll', updateBtns);
    const onResize = () => { setIsDesktop(window.innerWidth >= 1024); updateBtns(); };
    window.addEventListener('resize', onResize);
    return () => { t.removeEventListener('scroll', updateBtns); window.removeEventListener('resize', onResize); cancelInertia(); };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <BackgroundImageContainer
      imageUrl={bgImage}
      className="w-full relative flex flex-col lg:flex-row lg:items-center"
      style={{ minHeight: '680px', paddingTop: '50px', paddingBottom: '50px', backgroundSize: 'cover', backgroundPosition: 'center' }}
      blankStyle={{ minHeight: '680px', paddingTop: '50px', paddingBottom: '50px', backgroundColor: 'transparent' }}
    >
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', backgroundColor: 'rgba(10,10,10,0.85)', zIndex: 0 }} />

      <div className="lg:hidden w-full px-6 mb-6 relative z-10">
        <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 400, fontSize: '28px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '12px', lineHeight: 1.1 }}>Similar Experiences</h2>
      </div>

      {isDesktop && showLeft && (
        <button onClick={() => scrollBy(-600)}
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <ChevronLeft size={20} color="white" strokeWidth={2} />
        </button>
      )}

      <div ref={trackRef}
        className="similar-track"
        onMouseDown={e => { cancelInertia(); dragging.current = true; startXRef.current = e.pageX - (trackRef.current?.offsetLeft ?? 0); scrollStart.current = trackRef.current?.scrollLeft ?? 0; lastX.current = e.pageX; velocity.current = 0; if (trackRef.current) trackRef.current.style.cursor = 'grabbing'; }}
        onMouseLeave={() => { if (!dragging.current) return; dragging.current = false; if (trackRef.current) trackRef.current.style.cursor = 'grab'; startInertia(); }}
        onMouseUp={() => { if (!dragging.current) return; dragging.current = false; if (trackRef.current) trackRef.current.style.cursor = 'grab'; startInertia(); }}
        onMouseMove={e => { if (!dragging.current) return; e.preventDefault(); const x = e.pageX - (trackRef.current?.offsetLeft ?? 0); velocity.current = e.pageX - lastX.current; lastX.current = e.pageX; if (trackRef.current) { trackRef.current.scrollLeft = scrollStart.current - (x - startXRef.current); updateBtns(); } }}
        style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'scroll', overflowY: 'hidden', cursor: 'grab', userSelect: 'none', paddingLeft: isDesktop ? '60px' : '24px', paddingRight: isDesktop ? '60px' : '24px' } as React.CSSProperties}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: '25px', alignItems: 'flex-start', minWidth: 'max-content', paddingBottom: '8px' }}>
          {isDesktop && <div style={{ width: '20vw', flexShrink: 0 }} />}
          {isDesktop && (
            <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '8px' }}>
              <h2 style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif', fontWeight: 700, fontSize: '32px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '16px', lineHeight: 1.1 }}>Similar Experiences</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', lineHeight: 1.6 }}>Explore more curated experiences from our collection.</p>
            </div>
          )}
          {items.map((item: any) => {
            // Use recommendationImage if available, otherwise fall back to gallery[0]
            const coverImg = item.recommendationImage || (() => { try { const g = JSON.parse(item.gallery || '[]'); return Array.isArray(g) && g[0] ? g[0] : ''; } catch { return ''; } })();
            // Use recommendationTitle if available, otherwise fall back to name
            const title = item.recommendationTitle || item.name;
            // Use recommendationDescription if available, otherwise fall back to duration
            const subtitle = item.recommendationDescription || item.duration;
            // Generate link based on typeId
            const categorySlug = item.typeId ? toSlug(item.typeName || '') : 'experiences';
            const href = item.typeId ? `/experiences/${categorySlug}/${item.slug}` : `/experience-preview/${item.slug}`;
            return (
              <div key={item.id} className="relative group overflow-hidden flex-shrink-0" style={{ width: '310px', height: '550px', userSelect: 'none' }}>
                <img src={coverImg} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  {subtitle && <div className="text-xs font-bold uppercase tracking-wider text-right" style={{color: '#ffffff', fontWeight: '500'}}>{subtitle}</div>}
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider mb-4 leading-tight opacity-85" style={{fontWeight: '300'}}>{title}</h3>
                    <Link href={href}
                      className="trip-btn px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-85 relative overflow-hidden active:scale-95"
                      style={{ pointerEvents: 'auto', cursor: 'pointer', background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'inline-block' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.color = '#111'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.55)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // ripple effect
                        const btn = e.currentTarget;
                        const circle = document.createElement('span');
                        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
                        const radius = diameter / 2;
                        const rect = btn.getBoundingClientRect();
                        circle.style.cssText = `position:absolute;width:${diameter}px;height:${diameter}px;left:${e.clientX - rect.left - radius}px;top:${e.clientY - rect.top - radius}px;background:rgba(255,255,255,0.35);border-radius:50%;transform:scale(0);animation:ripple 0.5s linear;pointer-events:none;`;
                        btn.appendChild(circle);
                        setTimeout(() => circle.remove(), 600);
                      }}
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          {/* View More */}
          <div className="flex-shrink-0" style={{ width: '155px', height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <button
              className="px-6 py-3 rounded-sm transition-all duration-300 bg-white/20 border border-white/50 text-white font-semibold uppercase tracking-wider text-sm"
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#ffffff'; }}
            >View More</button>
          </div>
        </div>
      </div>

      {isDesktop && showRight && (
        <button onClick={() => scrollBy(600)}
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <ChevronRight size={20} color="white" strokeWidth={2} />
        </button>
      )}
    </BackgroundImageContainer>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ExperienceDetail() {
  const params = useParams<{ id?: string; categorySlug?: string; slug?: string }>();
  const slug = params.id ?? params.slug ?? params.categorySlug ?? '';

  const { data: exp, isLoading, isError } = trpc.cms.getExperienceBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch CTA background image from Media Library
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();

  // Parse gallery
  const gallery: string[] = (() => {
    try { const g = JSON.parse((exp as any)?.gallery || '[]'); return Array.isArray(g) ? g : []; } catch { return []; }
  })();

  // Background image for similar section (first gallery image)
  const bgImage = gallery[0] || '';

  // Show error only when confirmed not found (not during loading)
  if (isError) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>
        <Navigation />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#888' }}>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>Experience not found</p>
          <Link href="/experiences" style={{ color: '#F5569B', textDecoration: 'none', fontSize: '14px' }}>← Back to Experiences</Link>
        </div>
      </div>
    );
  }

  const details = (exp as any)?.details || [];
  const recommended = (exp as any)?.recommended || [];
  const labels: string[] = (exp as any)?.labels || [];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#6B6B6B' }}>
      <Navigation />

      {/* ── Header Info Block ── */}
      <div style={{ paddingTop: '55px', background: '#fff' }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: 12, color: '#999', marginBottom: 0, textAlign: 'left', paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)', paddingTop: '20px', paddingBottom: '0' }}>
          <Link href="/" style={{ color: '#999', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
          <Link href="/experiences" style={{ color: '#999', textDecoration: 'none' }}>Experiences</Link>
          <span style={{ margin: '0 6px', color: '#ccc' }}>/</span>
          <span style={{ color: '#555' }}>{exp?.name}</span>
        </p>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px 36px', textAlign: 'center' }}>
          {/* Category label from tags/labels */}
          {labels.length > 0 && (
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F5569B', marginBottom: 12, textAlign: 'center' }}>
              {labels.join(', ')}
            </p>
          )}

          {/* Main title */}
          <h1 style={{ fontFamily: 'AlternateGotNo1D', fontSize: '40px', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.01em', color: '#111', marginBottom: 24, textTransform: 'uppercase', textAlign: 'center' }}>
            {exp?.name}
          </h1>

          {/* Divider */}
          <div style={{ width: 48, height: 1, background: '#ccc', margin: '0 auto 32px' }} />

          {/* Three-column meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            {exp?.when && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f49e0b', marginBottom: 10 }}>WHEN</p>
                <p style={{ fontFamily: 'Manrope', fontStyle: 'italic', fontSize: 15, color: '#6B6B6B', lineHeight: 1.5 }}>{exp?.when}</p>
              </div>
            )}
            {exp?.price && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1d902b', marginBottom: 10 }}>PRICE</p>
                <p style={{ fontFamily: 'Manrope', fontStyle: 'italic', fontSize: 15, color: '#6B6B6B', lineHeight: 1.5 }}>{exp?.price}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#888', marginTop: 4 }}>(based on 2 sharing)</p>
              </div>
            )}
            {exp?.duration && (
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2c6faa', marginBottom: 10 }}>HOW LONG</p>
                <p style={{ fontFamily: 'Manrope', fontStyle: 'italic', fontSize: 15, color: '#6B6B6B', lineHeight: 1.5 }}>{exp?.duration}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Carousel ── */}
      {gallery.length > 0 && <HeroCarousel images={gallery} />}

      {/* ── Body Content ── */}
      <div className="tea-body">
        {/* Intro / description */}
        {exp?.description && (
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', marginBottom: 48, textAlign: 'center', boxSizing: 'border-box' }}>
            <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0, whiteSpace: 'pre-line' }}>
              {exp?.description}
            </p>
          </div>
        )}

        {/* Detail blocks — auto alternating left/right */}
        {details.map((block: any, idx: number) => {
          const isEven = idx % 2 === 0; // even: text-left image-right; odd: image-left text-right (mirror)
          return (
            <div key={block.id ?? idx} className={`tea-detail-row${isEven ? '' : ' mirror'}`}>
              {isEven ? (
                <>
                  <div className="tea-detail-text">
                    <div className="tea-detail-text-inner">
                      <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0, whiteSpace: 'pre-line' }}>
                        {block.description}
                      </p>
                    </div>
                  </div>
                  {block.imageUrl && (
                    <div className="tea-detail-img-wrap">
                      <img src={block.imageUrl} alt="" className="tea-detail-img" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {block.imageUrl && (
                    <div className="tea-detail-img-wrap">
                      <img src={block.imageUrl} alt="" className="tea-detail-img" />
                    </div>
                  )}
                  <div className="tea-detail-text">
                    <div className="tea-detail-text-inner">
                      <p style={{ fontSize: 18, lineHeight: 1.9, color: '#707070', fontWeight: 400, fontFamily: 'Manrope', margin: 0, whiteSpace: 'pre-line' }}>
                        {block.description}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Similar Experiences ── */}
      {recommended.length > 0 && <SimilarCarousel items={recommended} bgImage={bgImage} />}

      {/* ── Bottom CTA ── */}
      <section style={{ position: 'relative', width: '100%', height: 'clamp(260px, 30vw, 275px)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: (exp as any)?.ctaBgColor || '#1a1a1a' }}>
        {(homepageAssets as any)?.cta?.url && (
          <>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${(homepageAssets as any).cta.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
          </>
        )}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'AlternateGotNo1D', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>
            So, ready to start?
          </h2>
          <Link href="/make-an-enquiry">
            <button
              style={{ backgroundColor: '#111111', color: '#ffffff', fontFamily: 'Lato, sans-serif', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '14px 36px', border: '2px solid #111111', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s, transform 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#111111'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Get in Touch
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
