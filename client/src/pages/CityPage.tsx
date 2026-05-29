import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const CITY_DISPLAY = "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)";
const CITY_SANS = "var(--font-travel-sans, 'Cabin', 'Josefin Sans', 'Helvetica Neue', Arial, sans-serif)";
const CITY_TEXT = '#52575c';
const CITY_DARK = '#2f2f2f';

/**
 * Dynamic City Destination Page
 * Uses city slug to load city data from database
 * Template based on Sichuan.tsx design
 */

// Convert type name to slug (same as ExperienceCategoryPage)
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ExperienceItem component for What to See and Do section
function ExperienceItem({ item, index, onExplore }: { item: any; index: number; onExplore: () => void }) {
  const isEven = index % 2 === 0;
  const image = item.cityDisplayImage || item.experienceSlug;
  const title = item.experienceTitle || item.experienceName;
  const description = item.experienceDescription || '';

  const ExploreButton = () => (
    <button
      className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit"
      style={{ cursor: 'pointer', fontFamily: CITY_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.85px', lineHeight: 1.5 }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onClick={onExplore}
    >
      EXPLORE
    </button>
  );

  return (
    <div className="w-full bg-white py-0">
      <div className="relative">
        {/* Mobile: Image on top, text below */}
        <div className="lg:hidden w-full">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-full object-cover"
              style={{ height: '375px', objectFit: 'cover' }}
            />
          )}
          <div className="px-6 py-6">
            <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
              {title}
            </h3>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
              {description}
            </p>
            <ExploreButton />
          </div>
        </div>

        {/* Desktop: alternating layout */}
        {isEven ? (
          // Text left, image right
          <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
            <div className="w-1/2 px-3 flex flex-col justify-center items-center">
              <div className="max-w-md">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
                  {title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
                  {description}
                </p>
                <ExploreButton />
              </div>
            </div>
            <div className="flex items-center" style={{ minHeight: '380px', marginRight: '-9999px', paddingRight: '9999px', width: 'calc(50% + 9999px)' }}>
              {image && (
                <img
                  src={image}
                  alt={title}
                  className="object-cover"
                  style={{ width: '940px', height: '630px', objectFit: 'cover' }}
                />
              )}
            </div>
          </div>
        ) : (
          // Image left, text right
          <div className="hidden lg:flex items-center" style={{ minHeight: '380px' }}>
            <div className="flex items-center" style={{ minHeight: '380px', marginLeft: '-9999px', paddingLeft: '9999px', width: 'calc(50% + 9999px)' }}>
              {image && (
                <img
                  src={image}
                  alt={title}
                  className="object-cover"
                  style={{ width: '940px', height: '630px', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="w-1/2 px-3 flex flex-col justify-center items-center">
              <div className="max-w-md">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
                  {title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
                  {description}
                </p>
                <ExploreButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CityPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('Overview');
  const [expandedSections, setExpandedSections] = useState({ siCuisine: false });
  const [tripsShowLeftBtn, setTripsShowLeftBtn] = useState(false);
  const [tripsShowRightBtn, setTripsShowRightBtn] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);

  // Fetch city data by slug
  const { data: city, isLoading: cityLoading, error: cityError } = trpc.cms.getCityBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );

  // Fetch CTA background image from Media Library
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();

  // Fetch What to See and Do items
  const { data: whatToSeeItems = [] } = trpc.cms.listCityWhatToSee.useQuery(
    { cityId: city?.id ?? 0 },
    { enabled: !!city?.id }
  );

  const { data: cityTrips = [] } = trpc.cms.listItinerariesByCityTag.useQuery(
    { cityName: city?.name ?? '', citySlug: city?.slug ?? slug ?? '' },
    { enabled: !!city?.name && !!city?.slug }
  );

  // ── Explore Our Trips carousel ──
  const tripsTrackRef = useRef<HTMLDivElement>(null);
  const tripsDraggingRef = useRef(false);
  const tripsStartXRef = useRef(0);
  const tripsScrollStartRef = useRef(0);
  const tripsLastXRef = useRef(0);
  const tripsVelocityRef = useRef(0);
  const tripsRafRef = useRef<number | null>(null);

  const tripsCancelInertia = () => {
    if (tripsRafRef.current !== null) { cancelAnimationFrame(tripsRafRef.current); tripsRafRef.current = null; }
  };

  const tripsUpdateButtonVisibility = () => {
    const track = tripsTrackRef.current;
    if (!track) return;
    setTripsShowLeftBtn(track.scrollLeft > 0);
    setTripsShowRightBtn(track.scrollLeft < track.scrollWidth - track.clientWidth - 10);
  };

  const tripsStartInertia = () => {
    const track = tripsTrackRef.current;
    if (!track) return;
    const step = () => {
      tripsVelocityRef.current *= 0.92;
      if (Math.abs(tripsVelocityRef.current) < 0.5) { tripsVelocityRef.current = 0; tripsUpdateButtonVisibility(); return; }
      track.scrollLeft -= tripsVelocityRef.current;
      tripsUpdateButtonVisibility();
      tripsRafRef.current = requestAnimationFrame(step);
    };
    tripsRafRef.current = requestAnimationFrame(step);
  };

  const tripsScrollBy = (delta: number) => {
    tripsCancelInertia();
    const track = tripsTrackRef.current;
    if (!track) return;
    const target = track.scrollLeft + delta;
    const duration = 420;
    const start = track.scrollLeft;
    const startTime = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animStep = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = start + (target - start) * ease(t);
      if (t < 1) tripsRafRef.current = requestAnimationFrame(animStep);
    };
    tripsRafRef.current = requestAnimationFrame(animStep);
  };

  const tripsOnMouseDown = (e: React.MouseEvent) => {
    tripsCancelInertia();
    tripsDraggingRef.current = true;
    tripsStartXRef.current = e.pageX - (tripsTrackRef.current?.offsetLeft ?? 0);
    tripsScrollStartRef.current = tripsTrackRef.current?.scrollLeft ?? 0;
    tripsLastXRef.current = e.pageX;
    tripsVelocityRef.current = 0;
    if (tripsTrackRef.current) tripsTrackRef.current.style.cursor = 'grabbing';
  };

  const tripsOnMouseLeave = () => {
    if (!tripsDraggingRef.current) return;
    tripsDraggingRef.current = false;
    if (tripsTrackRef.current) tripsTrackRef.current.style.cursor = 'grab';
    tripsStartInertia();
  };

  const tripsOnMouseUp = () => {
    if (!tripsDraggingRef.current) return;
    tripsDraggingRef.current = false;
    if (tripsTrackRef.current) tripsTrackRef.current.style.cursor = 'grab';
    tripsStartInertia();
  };

  const tripsOnMouseMove = (e: React.MouseEvent) => {
    if (!tripsDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - (tripsTrackRef.current?.offsetLeft ?? 0);
    const walk = (x - tripsStartXRef.current) * 1.0;
    tripsVelocityRef.current = e.pageX - tripsLastXRef.current;
    tripsLastXRef.current = e.pageX;
    if (tripsTrackRef.current) {
      tripsTrackRef.current.scrollLeft = tripsScrollStartRef.current - walk;
      tripsUpdateButtonVisibility();
    }
  };

  useEffect(() => () => tripsCancelInertia(), []);

  useEffect(() => {
    const track = tripsTrackRef.current;
    if (!track) return;
    tripsUpdateButtonVisibility();
    const handleScroll = () => tripsUpdateButtonVisibility();
    track.addEventListener('scroll', handleScroll);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      tripsUpdateButtonVisibility();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(tripsUpdateButtonVisibility);
  }, [cityTrips.length, isDesktop]);

  if (cityLoading) {
    return (
      <div className="w-full bg-white min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (cityError || !city) {
    return (
      <div className="w-full bg-white min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <p className="text-gray-400 text-sm uppercase tracking-widest">City not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const cityName = city.name;
  const ctaBgColor = (city as any).ctaBgColor || '#a84900';
  const ctaBgImage = (homepageAssets as any)?.cta?.url || null;
  const ctaTextureOpacity = Math.max(0, Math.min(1, Number((homepageAssets as any)?.cta?.opacity ?? 28) / 100));

  // Visible items (first 3) and hidden items (rest)
  const visibleItems = whatToSeeItems.slice(0, 3);
  const hiddenItems = whatToSeeItems.slice(3);
  const cityTabs = [
    { label: 'Overview', id: 'overview' },
    ...(cityTrips.length > 0 ? [{ label: 'Itineraries', id: 'itineraries' }] : []),
    { label: 'See & Do', id: 'see-do' },
    { label: 'Food', id: 'food' }
  ];

  return (
    <div className="w-full bg-white min-h-screen">
      <Navigation />

      {/* Hero Section */}
      {bannerImageLoaded && (
        <div className="relative w-full bg-cover bg-center" style={{
          backgroundImage: `url(${(city as any).coverImage || ''})`,
          backgroundAttachment: 'scroll',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          height: '400px',
        }}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative h-full flex items-center justify-center">
            <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white uppercase text-center px-6" style={{
              fontFamily: CITY_DISPLAY,
              fontSize: 'clamp(46px, 6vw, 60px)',
              letterSpacing: '3px',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
              fontWeight: 400,
              lineHeight: 0.9,
              maxWidth: '980px'
            }}>
              {(city as any).bannerTitle}
            </h1>
          </div>
        </div>
      )}
      {/* Hidden image to detect if banner image loads successfully */}
      {(city as any).coverImage && (
        <img
          src={(city as any).coverImage}
          alt=""
          style={{ display: 'none' }}
          onLoad={() => setBannerImageLoaded(true)}
          onError={() => setBannerImageLoaded(false)}
        />
      )}
      {/* Blank space while loading */}
      {!bannerImageLoaded && (
        <div style={{ height: '400px', backgroundColor: 'transparent' }}></div>
      )}

      {/* Navigation Tabs */}
      <div className="w-full" style={{ height: '48px', backgroundColor: '#F3F3F3' }}>
        <style>{`
          .tab-underline { position: relative; padding-bottom: 2px; }
          .tab-underline::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: #F5569B; transition: width 0.25s ease; }
          .tab-underline:hover::after, .tab-underline.tab-active::after { width: 100%; }
        `}</style>
        <div className="h-full flex items-center justify-center px-4 md:px-0">
          <nav className="flex gap-3 md:gap-12 h-full items-center flex-wrap md:flex-nowrap justify-center">
            {cityTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  const element = document.getElementById(tab.id);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`tab-underline text-xs font-semibold uppercase tracking-wider text-black flex-shrink-0 ${activeTab === tab.label ? 'tab-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Section */}
      <div id="overview" className="w-full bg-white py-8 md:py-12" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', marginBottom: '0' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: CITY_DISPLAY, fontSize: 'clamp(36px, 4vw, 45px)', fontWeight: 400, letterSpacing: '2.25px', lineHeight: 1, color: CITY_DARK }}>
            {(city as any).introductionTitle || `Why Should You Travel to ${cityName} With Us?`}
          </h2>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
            {(city as any).introductionDescription || ''}
          </p>
        </div>
      </div>

      {/* Explore Our Trips Section */}
      {cityTrips.length > 0 && (
        <div
          id="itineraries"
          className="w-full relative flex flex-col lg:flex-row lg:items-center"
          style={{
            minHeight: '680px',
            marginTop: '48px',
            paddingTop: '50px',
            paddingBottom: '50px',
            backgroundImage: `url(${(city as any).coverImage || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'scroll',
          }}
        >
          <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', backgroundColor: 'rgba(10,10,10,0.85)', zIndex: 0 }} />

          {/* Mobile title */}
          <div className="lg:hidden w-full px-6 mb-6 relative z-10">
            <h2 style={{ fontFamily: CITY_DISPLAY, fontWeight: 400, fontSize: '36px', color: 'white', textTransform: 'uppercase', letterSpacing: '2.25px', marginBottom: '12px', lineHeight: 1 }}>
              Explore Our Trips
            </h2>
            <p style={{ fontFamily: CITY_SANS, fontSize: '17px', color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5 }}>
              Explore our sample trips or get in touch to begin your bespoke adventure.
            </p>
          </div>

          {isDesktop && (
            <button
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: tripsShowLeftBtn ? 1 : 0, pointerEvents: tripsShowLeftBtn ? 'auto' : 'none' }}
              onClick={() => tripsScrollBy(-600)}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            >
              <ChevronLeft size={20} color="white" strokeWidth={2} />
            </button>
          )}

          <div
            ref={tripsTrackRef}
            className="similar-track"
            onMouseDown={tripsOnMouseDown}
            onMouseLeave={tripsOnMouseLeave}
            onMouseUp={tripsOnMouseUp}
            onMouseMove={tripsOnMouseMove}
            style={{ position: 'relative', zIndex: 1, width: '100%', overflowX: 'scroll', overflowY: 'hidden', cursor: 'grab', userSelect: 'none', paddingLeft: isDesktop ? '60px' : '24px', paddingRight: isDesktop ? '60px' : '24px' } as React.CSSProperties}
          >
            <div style={{ display: 'flex', flexDirection: 'row', gap: '25px', alignItems: 'flex-start', minWidth: 'max-content', paddingBottom: '8px' }}>
              {isDesktop && <div style={{ width: '20vw', flexShrink: 0 }} />}
              {isDesktop && (
                <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '8px' }}>
                  <h2 style={{ fontFamily: CITY_DISPLAY, fontWeight: 400, fontSize: '45px', color: 'white', textTransform: 'uppercase', letterSpacing: '2.25px', marginBottom: '16px', lineHeight: 1 }}>
                    Explore Our Trips
                  </h2>
                  <p style={{ fontFamily: CITY_SANS, fontSize: '17px', color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5 }}>
                    Explore our sample trips or get in touch to begin your bespoke adventure.
                  </p>
                </div>
              )}
              {cityTrips.map((trip: any) => (
                <div key={trip.id} className="relative group overflow-hidden flex-shrink-0" style={{ width: '310px', height: '550px', userSelect: 'none', background: '#222' }}>
                  {(trip.coverImage || trip.bannerImage || (city as any).coverImage) && (
                    <img src={trip.coverImage || trip.bannerImage || (city as any).coverImage} alt={trip.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" draggable={false} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />
                  <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider text-right" style={{ fontFamily: CITY_SANS, color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.85px', lineHeight: 1.5 }}>
                      {trip.howLong || `${trip.days ?? 1} DAYS`}
                    </div>
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider mb-3 leading-tight opacity-90" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28 }}>
                        {trip.name}
                      </h3>
                      {trip.shortDescription && (
                        <p style={{ fontFamily: CITY_SANS, fontSize: '13px', fontWeight: 400, letterSpacing: '0.45px', lineHeight: 1.45, color: 'rgba(255,255,255,0.82)', marginBottom: '16px' }}>
                          {trip.shortDescription}
                        </p>
                      )}
                      <button
                        className="px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-90"
                        style={{ cursor: 'pointer', background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(6px)', fontFamily: CITY_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.85px', lineHeight: 1.5 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${trip.slug}`); }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.color = '#111'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.55)'; e.currentTarget.style.color = '#fff'; }}
                      >
                        Explore Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex-shrink-0" style={{ width: '155px', height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} />
            </div>
          </div>

          {isDesktop && (
            <button
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, transition: 'background 0.2s, opacity 0.2s', opacity: tripsShowRightBtn ? 1 : 0, pointerEvents: tripsShowRightBtn ? 'auto' : 'none' }}
              onClick={() => tripsScrollBy(600)}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            >
              <ChevronRight size={20} color="white" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* What to See and Do Section */}
      {whatToSeeItems.length > 0 && (
        <div id="see-do" className="w-full bg-white py-0" style={{ marginTop: '100px' }}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-black mb-12 text-center font-display" style={{ fontFamily: CITY_DISPLAY, fontSize: 'clamp(36px, 4vw, 45px)', fontWeight: 400, letterSpacing: '2.25px', lineHeight: 1, color: '#000' }}>
              What to See and Do in {cityName}
            </h2>
          </div>

          {/* First 3 items always visible */}
          {visibleItems.map((item, idx) => (
            <ExperienceItem
              key={item.id}
              item={item}
              index={idx}
              onExplore={() => {
                if (item.experienceSlug && item.experienceTypeName) {
                  navigate(`/experiences/${toSlug(item.experienceTypeName)}/${item.experienceSlug}`);
                }
              }}
            />
          ))}

          {/* Hidden items (expandable) */}
          {hiddenItems.length > 0 && (
            <>
              <div style={{ display: expandedSections.siCuisine ? 'block' : 'none' }}>
              {hiddenItems.map((item, idx) => (
                <ExperienceItem
                  key={item.id}
                  item={item}
                  index={idx + 3}
                  onExplore={() => {
                    if (item.experienceSlug && item.experienceTypeName) {
                      navigate(`/experiences/${toSlug(item.experienceTypeName)}/${item.experienceSlug}`);
                    }
                  }}
                />
              ))}
              </div>

              {/* VIEW MORE / SHOW LESS Button */}
              <div className="w-full bg-white py-8 flex justify-center">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, siCuisine: !prev.siCuisine }))}
                  className="px-6 py-3 bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 w-fit"
                  style={{ cursor: 'pointer', fontFamily: CITY_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.85px', lineHeight: 1.5 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'black'; e.currentTarget.style.boxShadow = 'inset 0 0 0 2px black'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'black'; e.currentTarget.style.color = 'white'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {expandedSections.siCuisine ? 'SHOW LESS' : 'VIEW MORE'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Culinary Travel Section */}
      <div id="food" className="w-full bg-white" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
        <h2 className="text-center text-2xl md:text-4xl font-bold uppercase tracking-wider mb-16 px-4" style={{ fontFamily: CITY_DISPLAY, fontSize: 'clamp(36px, 4vw, 45px)', fontWeight: 400, letterSpacing: '2.25px', lineHeight: 1, color: '#000' }}>
          Culinary Travel
        </h2>

        {/* Large Card */}
        <div className="mx-auto px-4 md:px-8 mb-12" style={{ maxWidth: '1320px' }}>
          <div className="hidden xl:flex items-center bg-gray-100" style={{ height: '640px' }}>
            <div className="flex items-center bg-gray-100" style={{ width: '60%', height: '640px', flex: '0 0 auto' }}>
              {(city as any).culinaryTravelLargeImage && (
                <img
                  src={(city as any).culinaryTravelLargeImage}
                  alt={`${cityName} Cuisine`}
                  className="object-cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="flex flex-col justify-center items-center bg-gray-100 pl-8 pr-8" style={{ width: '40%', height: '640px' }}>
              <div className="max-w-md">
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
                  {(city as any).culinaryTravelLargeTitle || `${cityName} Cuisine`}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
                  {(city as any).culinaryTravelLargeDescription || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="xl:hidden w-full bg-gray-100">
            {(city as any).culinaryTravelLargeImage && (
              <img
                src={(city as any).culinaryTravelLargeImage}
                alt={`${cityName} Cuisine`}
                className="w-full object-cover"
                style={{ height: '375px', objectFit: 'cover' }}
              />
            )}
            <div className="p-6">
              <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-6" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
                {(city as any).culinaryTravelLargeTitle || `${cityName} Cuisine`}
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
                {(city as any).culinaryTravelLargeDescription || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Two Small Cards */}
        <div className="mx-auto px-4 md:px-8" style={{ maxWidth: '1320px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="flex flex-col bg-gray-100" style={{ height: '600px' }}>
              {(city as any).culinaryTravelSmall1Image && (
                <img
                  src={(city as any).culinaryTravelSmall1Image}
                  alt={(city as any).culinaryTravelSmall1Title || ''}
                  className="w-full object-cover"
                  style={{ height: '390px', objectFit: 'cover' }}
                />
              )}
              <div className="p-6" style={{ height: '210px', overflow: 'hidden' }}>
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-4" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
                  {(city as any).culinaryTravelSmall1Title || ''}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
                  {(city as any).culinaryTravelSmall1Description || ''}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col bg-gray-100" style={{ height: '600px' }}>
              {(city as any).culinaryTravelSmall2Image && (
                <img
                  src={(city as any).culinaryTravelSmall2Image}
                  alt={(city as any).culinaryTravelSmall2Title || ''}
                  className="w-full object-cover"
                  style={{ height: '390px', objectFit: 'cover' }}
                />
              )}
              <div className="p-6" style={{ height: '210px', overflow: 'hidden' }}>
                <h3 className="text-sm md:text-base font-semibold uppercase tracking-widest text-gray-800 mb-4" style={{ fontFamily: CITY_SANS, fontSize: '18px', fontWeight: 700, letterSpacing: '1.8px', lineHeight: 1.28, color: '#000' }}>
                  {(city as any).culinaryTravelSmall2Title || ''}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed" style={{ fontFamily: CITY_SANS, fontSize: '17px', fontWeight: 400, letterSpacing: '0.85px', lineHeight: 1.5, color: CITY_TEXT }}>
                  {(city as any).culinaryTravelSmall2Description || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '150px',
          backgroundColor: ctaBgColor,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '40px',
          paddingRight: '40px',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundImage: ctaBgImage ? `url(${ctaBgImage})` : '', backgroundSize: '420px 420px', backgroundRepeat: 'repeat', opacity: ctaTextureOpacity, mixBlendMode: 'normal', filter: 'contrast(1.45) brightness(1.08)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '12px', textAlign: 'left', flex: 1 }}>
          <h2 style={{ fontFamily: CITY_DISPLAY, fontSize: '45px', fontWeight: 400, color: '#ffffff', letterSpacing: '2.25px', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
            So, ready to start?
          </h2>
        </div>
        <button
          style={{ position: 'relative', zIndex: 1, backgroundColor: '#111111', color: '#ffffff', fontFamily: CITY_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.85px', lineHeight: 1.5, textTransform: 'uppercase', padding: '14px 36px', border: '2px solid #111111', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s, transform 0.1s', whiteSpace: 'nowrap', marginLeft: '40px' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#111111'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={() => navigate('/make-an-enquiry')}
        >
          Get in Touch
        </button>
      </section>

      {/* Other Popular Destinations */}
      <OtherPopularDestinations currentSlug={slug || ''} />

      <Footer />
    </div>
  );
}

// Other Popular Destinations Component
function OtherPopularDestinations({ currentSlug }: { currentSlug: string }) {
  const [, navigate] = useLocation();
  const destinationsRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);
  const [velocity, setVelocity] = React.useState(0);
  const [lastX, setLastX] = React.useState(0);
  const [lastTime, setLastTime] = React.useState(0);
  const animationRef = React.useRef<number | null>(null);

  // Fetch all cities from database
  const { data: allCities = [] } = trpc.cms.listCities.useQuery();

  // Filter out current city
  const otherCities = allCities.filter((c: any) => c.slug !== currentSlug);

  // Show each city once
  const destinations = otherCities;
  const cardWidth = 220 + 16;
  const totalWidth = otherCities.length * cardWidth;

  React.useEffect(() => {
    if (destinationsRef.current && totalWidth > 0) {
      destinationsRef.current.scrollLeft = totalWidth;
    }
  }, [totalWidth]);

  const handleScroll = () => {
    if (!destinationsRef.current || totalWidth === 0) return;
    const container = destinationsRef.current;
    const sl = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (sl < totalWidth * 0.3) {
      container.scrollLeft = totalWidth + sl;
    } else if (sl > totalWidth * 2.7 || sl >= maxScroll - 10) {
      container.scrollLeft = sl - totalWidth;
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeftState(destinationsRef.current?.scrollLeft || 0);
    setLastX(e.clientX);
    setLastTime(Date.now());
    setVelocity(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.clientX;
    const walk = (x - startX) * 0.8;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    const xDiff = x - lastX;
    setVelocity(timeDiff > 0 ? xDiff / timeDiff : 0);
    setLastX(x);
    setLastTime(currentTime);
    if (destinationsRef.current) {
      destinationsRef.current.scrollLeft = scrollLeftState - walk;
      handleScroll();
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    let v = velocity;
    const animate = () => {
      if (destinationsRef.current && Math.abs(v) > 0.1) {
        destinationsRef.current.scrollLeft -= v * 30;
        handleScroll();
        v *= 0.92;
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      let v = velocity;
      const animate = () => {
        if (destinationsRef.current && Math.abs(v) > 0.1) {
          destinationsRef.current.scrollLeft -= v * 30;
          handleScroll();
          v *= 0.92;
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();
    }
  };

  if (otherCities.length === 0) return null;

  return (
    <div className="w-full bg-white py-16 md:py-20">
      <h2 className="text-center text-2xl md:text-4xl font-bold uppercase tracking-wider mb-12 md:mb-16 px-4" style={{ fontFamily: CITY_DISPLAY, fontSize: 'clamp(36px, 4vw, 45px)', fontWeight: 400, letterSpacing: '2.25px', lineHeight: 1, color: '#000' }}>
        Other Popular Destinations
      </h2>
      <div
        ref={destinationsRef}
        className="flex gap-0 overflow-x-scroll pl-4 pr-4"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onScroll={handleScroll}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', scrollBehavior: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {destinations.map((dest: any, index: number) => (
          <div
            key={`${dest.id}-${index}`}
            className="flex-shrink-0 relative overflow-hidden group cursor-pointer mr-4"
            style={{ width: '220px', height: '320px' }}
            onClick={() => { if (!isDragging) navigate(`/destinations/${dest.slug}`); }}
          >
            {dest.cityCardImage && (
              <img
                src={dest.cityCardImage}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                draggable={false}
              />
            )}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-lg md:text-xl font-bold uppercase tracking-wider text-center" style={{ fontFamily: CITY_DISPLAY, fontSize: 'clamp(30px, 2.5vw, 38px)', fontWeight: 400, letterSpacing: '1.9px', lineHeight: 1 }}>
                {dest.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
