import { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from '@/components/Navigation';

/**
 * WhyUs Page — Full-screen paged layout
 *
 * FORWARD (scroll down):
 *   Left  panel exits: translateY(0 → -100%)  [slides UP out]
 *   Left  panel enters: translateY(+100% → 0) [slides UP in from bottom]
 *   Right panel exits: translateY(0 → +100%)  [slides DOWN out]
 *   Right panel enters: translateY(-100% → 0) [slides DOWN in from top]
 *
 * BACKWARD (scroll up) — mirror:
 *   Left  panel exits: translateY(0 → +100%)  [slides DOWN out]
 *   Left  panel enters: translateY(-100% → 0) [slides DOWN in from top]
 *   Right panel exits: translateY(0 → -100%)  [slides UP out]
 *   Right panel enters: translateY(+100% → 0) [slides UP in from bottom]
 *
 * Text / Image alternates per slide (odd=text-left, even=text-right)
 */

interface Slide {
  num?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  isCover?: boolean;
}

const SLIDES: Slide[] = [
  {
    isCover: true,
    title: 'WHY US?',
    subtitle: 'What sets us apart',
    description: '5 reasons to travel with Wayseek',
  },
  {
    num: '01',
    title: 'Unmatched Local Knowledge',
    description:
      "Our guides and partners have spent decades living and breathing the landscapes, cultures, and hidden corners of China. We don't follow itineraries — we follow curiosity, leading you to places most travellers never find.",
    image: '/manus-storage/sichuan-1-main_7e303aa1.avif',
  },
  {
    num: '02',
    title: 'Truly Tailor-Made',
    description:
      'Every journey we craft is built from scratch around you — your pace, your passions, your idea of luxury. No templates, no group tours. Just a trip that feels like it was made for no one else.',
    image: '/manus-storage/yunnan-1-main_bc2d600d.avif',
  },
  {
    num: '03',
    title: 'Access Beyond the Obvious',
    description:
      "From private tea harvests in Ya'an to dawn ceremonies at remote Tibetan monasteries, we open doors that remain closed to most. Our relationships with local communities give you access that simply cannot be booked elsewhere.",
    image: '/manus-storage/zhangjiajie-1-main_aad9f7a1.avif',
  },
  {
    num: '04',
    title: 'Seamless from Start to Finish',
    description:
      'We handle every detail — transfers, accommodation, permits, guides — so you can be fully present. Our team is reachable throughout your journey, ensuring that the unexpected becomes part of the adventure, not a disruption.',
    image: '/manus-storage/guilin-1-main_bb73c4c8.avif',
  },
  {
    num: '05',
    title: 'Travel That Gives Back',
    description:
      'We work exclusively with local operators, stay in family-run guesthouses, and contribute to the communities we visit. When you travel with Wayseek, your journey supports the very people and places that make it extraordinary.',
    image: '/manus-storage/hero-rural-life_7e74a18e.avif',
  },
];

const DURATION = 900;
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

type Direction = 'forward' | 'backward';
type AnimRole = 'entering' | 'exiting';

interface SlideState {
  index: number;
  role: AnimRole | 'idle';
  direction: Direction;
}

// Returns the CSS animation name for a panel
function animName(panel: 'left' | 'right', role: AnimRole, dir: Direction) {
  return `ws_${panel}_${role}_${dir}`;
}

// Preload all slide images so they are cached before the user navigates
function preloadImages() {
  SLIDES.forEach(slide => {
    if (slide.image) {
      const img = new Image();
      img.src = slide.image;
    }
  });
}

export default function WhyUs() {
  const [current, setCurrent] = useState<SlideState>({ index: 0, role: 'idle', direction: 'forward' });
  const [prev, setPrev] = useState<SlideState | null>(null);

  // Preload all images on mount
  useEffect(() => { preloadImages(); }, []);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((nextIdx: number) => {
    if (lockRef.current) return;
    if (nextIdx === current.index) return;
    if (nextIdx < 0 || nextIdx >= SLIDES.length) return;

    lockRef.current = true;
    const dir: Direction = nextIdx > current.index ? 'forward' : 'backward';

    setPrev({ index: current.index, role: 'exiting', direction: dir });
    setCurrent({ index: nextIdx, role: 'entering', direction: dir });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPrev(null);
      setCurrent(s => ({ ...s, role: 'idle' }));
      lockRef.current = false;
    }, DURATION + 60);
  }, [current.index]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current.index + 1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(current.index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current.index, goTo]);

  // Wheel
  const wheelLock = useRef(false);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      setTimeout(() => { wheelLock.current = false; }, DURATION + 150);
      if (e.deltaY > 0) goTo(current.index + 1);
      else goTo(current.index - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [current.index, goTo]);

  // Touch
  const touchY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 50) return;
    if (dy > 0) goTo(current.index + 1);
    else goTo(current.index - 1);
  };

  // ── Render a single slide ─────────────────────────────────────────────────
  const renderSlide = (state: SlideState) => {
    const slide = SLIDES[state.index];
    const { role, direction } = state;

    // Odd slide index (1,3,5) = text left / image right
    // Even slide index (2,4) = image left / text right
    // Cover (0) = text left / decorative right
    const textOnLeft = slide.isCover || state.index % 2 === 1;

    const anim = (panel: 'left' | 'right') =>
      role === 'idle'
        ? 'none'
        : `${animName(panel, role as AnimRole, direction)} ${DURATION}ms ${EASE} both`;

    const leftContent = textOnLeft ? 'text' : 'image';
    const rightContent = textOnLeft ? 'image' : 'text';

    const textBlock = (
      <div style={{ willChange: 'transform', animation: anim('left') }}>
        {slide.isCover ? (
          <>
            <p style={{ fontFamily: 'sans-serif', fontSize: 'clamp(10px,1vw,13px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8b89a', margin: '0 0 24px 0' }}>
              {slide.subtitle}
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(56px,9vw,120px)', fontWeight: 400, color: '#fff', lineHeight: 0.95, margin: 0 }}>
              WHY<br />US?
            </h1>
            <p style={{ fontFamily: 'sans-serif', fontSize: 'clamp(11px,1.1vw,14px)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '32px 0 0 0' }}>
              {slide.description}
            </p>
            <button
              onClick={() => goTo(1)}
              style={{ marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 28px', cursor: 'pointer', transition: 'border-color 0.25s,background 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8b89a'; e.currentTarget.style.background = 'rgba(200,184,154,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'none'; }}
            >
              Begin ›
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: 'sans-serif', fontSize: 'clamp(10px,1vw,13px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8b89a', margin: '0 0 20px 0' }}>
              {slide.num} / 05
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px,3.2vw,48px)', fontWeight: 400, color: '#fff', lineHeight: 1.2, margin: '0 0 28px 0', textTransform: 'uppercase' }}>
              {slide.title}
            </h2>
            <p style={{ fontFamily: 'sans-serif', fontSize: 'clamp(13px,1.1vw,16px)', color: 'rgba(255,255,255,0.62)', lineHeight: 1.8, maxWidth: '400px', margin: 0 }}>
              {slide.description}
            </p>
          </>
        )}
      </div>
    );

    const imageBlock = slide.isCover ? (
      <div style={{ width: '100%', height: '100%', background: '#00a0a6', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.55, backgroundImage: 'url(/manus-storage/texture-noise_3d19203d.png)', backgroundRepeat: 'repeat', backgroundSize: '300px 300px' }} />
      </div>
    ) : (
      <>
        <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </>
    );

    return (
      <>
        {/* Left panel — outer is static clip container, inner slides */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
          overflow: 'hidden', zIndex: 1,
        }}>
          {leftContent === 'text' ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#00a0a6',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              paddingLeft: 'clamp(40px,8vw,120px)', paddingRight: '40px',
              willChange: 'transform', animation: anim('left'),
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.55, backgroundImage: 'url(/manus-storage/texture-noise_3d19203d.png)', backgroundRepeat: 'repeat', backgroundSize: '300px 300px', pointerEvents: 'none' }} />
              {textBlock.props.children}
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, willChange: 'transform', animation: anim('left') }}>
              {imageBlock}
            </div>
          )}
        </div>

        {/* Right panel — outer is static clip container, inner slides */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%',
          overflow: 'hidden', zIndex: 1,
        }}>
          {rightContent === 'text' ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#00a0a6',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              paddingLeft: 'clamp(40px,5vw,80px)', paddingRight: '40px',
              willChange: 'transform', animation: anim('right'),
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.55, backgroundImage: 'url(/manus-storage/texture-noise_3d19203d.png)', backgroundRepeat: 'repeat', backgroundSize: '300px 300px', pointerEvents: 'none' }} />
              {textBlock.props.children}
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, willChange: 'transform', animation: anim('right') }}>
              {imageBlock}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#00a0a6' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Navigation />

      {/* Exiting slide — z 1 */}
      {prev && (
        <div key={`prev-${prev.index}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {renderSlide(prev)}
        </div>
      )}

      {/* Entering slide — z 2 */}
      <div key={`curr-${current.index}`} style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        {renderSlide(current)}
      </div>

      {/* Number nav */}
      <div style={{ position: 'fixed', right: 'clamp(20px,3vw,48px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}>
        {SLIDES.slice(1).map((_, i) => {
          const idx = i + 1;
          const active = current.index === idx;
          const isLast = idx === SLIDES.length - 1;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={() => goTo(idx)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'sans-serif', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)',
                  padding: '6px 0', transition: 'color 0.3s',
                  lineHeight: 1,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)'; }}
              >
                {String(idx).padStart(2, '0')}
              </button>
              {!isLast && (
                <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.25)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll hint / prev button */}
      {current.index === 0 && (
        <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: 'wsBounce 2s ease-in-out infinite' }}>
            <span style={{ fontFamily: 'sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Scroll</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px' }}>↓</span>
          </div>
        </div>
      )}
      {current.index > 0 && (
        <div style={{ position: 'fixed', bottom: '32px', left: 'clamp(40px,8vw,120px)', zIndex: 30 }}>
          <button onClick={() => goTo(current.index - 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
          >
            ← Previous
          </button>
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        /* FORWARD: left exits UP, right exits DOWN */
        @keyframes ws_left_exiting_forward  { from{transform:translateY(0)}  to{transform:translateY(-100%)} }
        @keyframes ws_right_exiting_forward { from{transform:translateY(0)}  to{transform:translateY(100%)}  }
        /* FORWARD: left enters from BOTTOM, right enters from TOP */
        @keyframes ws_left_entering_forward  { from{transform:translateY(100%)}  to{transform:translateY(0)} }
        @keyframes ws_right_entering_forward { from{transform:translateY(-100%)} to{transform:translateY(0)} }

        /* BACKWARD: left exits DOWN, right exits UP */
        @keyframes ws_left_exiting_backward  { from{transform:translateY(0)}  to{transform:translateY(100%)}  }
        @keyframes ws_right_exiting_backward { from{transform:translateY(0)}  to{transform:translateY(-100%)} }
        /* BACKWARD: left enters from TOP, right enters from BOTTOM */
        @keyframes ws_left_entering_backward  { from{transform:translateY(-100%)} to{transform:translateY(0)} }
        @keyframes ws_right_entering_backward { from{transform:translateY(100%)}  to{transform:translateY(0)} }

        @keyframes wsBounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)}
        }
      `}</style>
    </div>
  );
}
