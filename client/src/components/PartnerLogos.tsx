import React, { useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

const fallbackLogos = [
  { src: '/manus-storage/VirtuosoPart-of_-150x150_55a260ef.png', alt: 'Virtuoso', invert: true },
  { src: '/manus-storage/Fan-ClubPart-of_-150x150_f293bc50.png', alt: 'Fan Club', invert: true },
  { src: '/manus-storage/PenClubPart-of_-150x150_d0bbd11a.png', alt: 'Pen Club', invert: true },
  { src: '/manus-storage/Forbes-193x40-1_bda291d3.svg', alt: 'Forbes', invert: false },
  { src: '/manus-storage/EnsemblePart-of_-150x150_40c6d44f.png', alt: 'Ensemble', invert: true },
  { src: '/manus-storage/EF_Education_First_logo.svg_c374a76a.png', alt: 'EF Education First', invert: false, height: 80 },
  { src: '/manus-storage/coveteur-logo-cropped_eaacd874.svg', alt: 'Coveteur', invert: false },
  { src: '/manus-storage/CNBC-193x40-1_40120200.svg', alt: 'CNBC', invert: false },
  { src: '/manus-storage/A-LIST-Black2026_3e5a65af.png', alt: 'Travel + Leisure A-List 2026', invert: false },
];

export default function PartnerLogos() {
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();

  // 使用 DB sponsors，若无数据则 fallback
  const logos = (homepageData?.sponsors && homepageData.sponsors.length > 0)
    ? homepageData.sponsors.map(sp => ({ src: sp.logo || '', alt: sp.name, invert: false, url: sp.url || undefined }))
    : fallbackLogos;

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const cancelInertia = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.5) {
        velocityRef.current = 0;
        return;
      }
      track.scrollLeft -= velocityRef.current;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelInertia(), []);

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    draggingRef.current = true;
    startXRef.current = e.pageX;
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };

  const onMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const walk = e.pageX - startXRef.current;
    velocityRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    cancelInertia();
    draggingRef.current = true;
    startXRef.current = e.touches[0].pageX;
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.touches[0].pageX;
    velocityRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const walk = e.touches[0].pageX - startXRef.current;
    velocityRef.current = e.touches[0].pageX - lastXRef.current;
    lastXRef.current = e.touches[0].pageX;
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const onTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startInertia();
  };

  return (
    <section className="bg-white" style={{ paddingTop: '96px', paddingBottom: '48px', overflow: 'hidden' }}>
      {/* Outer wrapper: clips overflow */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        {/* Scrollable track */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'scroll',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            cursor: 'grab',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: '24px',
            paddingRight: '24px',
            gap: '56px',
            alignItems: 'center',
          }}
        >
          {logos.map((logo, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              height: '120px',
              minWidth: '200px',
              }}
            >
              {(logo as any).url ? (
                <a href={(logo as any).url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    draggable={false}
                    style={{
                    height: (logo as any).height ? `${(logo as any).height}px` : '100%',
                    width: 'auto',
                    maxWidth: '320px',
                      objectFit: 'contain',
                      filter: logo.invert ? 'invert(1) grayscale(100%)' : 'grayscale(100%)',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                    }}
                  />
                </a>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  draggable={false}
                  style={{
                  height: (logo as any).height ? `${(logo as any).height}px` : '100%',
                  width: 'auto',
                  maxWidth: '320px',
                    objectFit: 'contain',
                    filter: logo.invert ? 'invert(1) grayscale(100%)' : 'grayscale(100%)',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
