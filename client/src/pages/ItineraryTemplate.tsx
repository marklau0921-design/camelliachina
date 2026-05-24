/**
 * Itinerary Template Page
 * Design: Wayseek luxury travel, clean editorial layout
 * Shows a sample itinerary for admin reference
 */

import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const SAMPLE_ITINERARY = {
  name: '5-Day Chengdu Deep Dive',
  slug: '5-day-chengdu-deep-dive',
  shortDescription: 'Immerse yourself in the laid-back culture of Chengdu, from giant pandas to Sichuan spice.',
  description: 'This five-day itinerary takes you to the heart of Sichuan Province, where ancient traditions meet modern creativity. Spend time with giant pandas in their natural habitat, learn the secrets of Sichuan cuisine, and experience the unique teahouse culture that defines Chengdu\'s relaxed pace of life.',
  coverImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero1-4G32VK9iXnY5zQXxnmzmtg.webp',
  days: 5,
  price: 'From $2,400 per person',
  difficulty: 'easy',
  maxPeople: 12,
  tags: ['Pandas', 'Culinary', 'Culture', 'Relaxed Pace'],
  dayByDay: [
    {
      day: 1,
      title: 'Arrival in Chengdu',
      description: 'Arrive in Chengdu and settle into your luxury hotel. This evening, explore the vibrant streets of Kuanzhai Xiangzi, the heart of old Chengdu. Dinner at a traditional Sichuan restaurant introduces you to the bold flavors of the region.',
      highlights: ['Hotel check-in', 'Kuanzhai Xiangzi exploration', 'Welcome dinner'],
    },
    {
      day: 2,
      title: 'Giant Pandas & Tea Culture',
      description: 'Early morning visit to the Chengdu Research Base of Giant Panda Breeding. Spend the morning observing these gentle creatures in a semi-natural habitat. Afternoon tea ceremony at a century-old teahouse, where you\'ll learn the art of gongfu tea.',
      highlights: ['Panda Research Base', 'Tea ceremony', 'Teahouse culture'],
    },
    {
      day: 3,
      title: 'Culinary Masterclass',
      description: 'Morning market tour in Chengdu\'s bustling wet markets, learning to identify Sichuan ingredients. Afternoon cooking class where you\'ll prepare authentic Sichuan dishes. Evening feast featuring your creations.',
      highlights: ['Wet market tour', 'Cooking class', 'Dinner with your dishes'],
    },
    {
      day: 4,
      title: 'Sichuan Opera & Local Life',
      description: 'Visit a traditional Sichuan Opera performance, where masked performers tell ancient stories. Afternoon spent in a local neighborhood, visiting a family home and learning about daily life in Chengdu. Evening at a traditional teahouse with live music.',
      highlights: ['Sichuan Opera', 'Local family visit', 'Teahouse evening'],
    },
    {
      day: 5,
      title: 'Departure',
      description: 'Final morning exploring Wenshu Monastery, one of Chengdu\'s most important Buddhist temples. Lunch at a local favorite before heading to the airport. Depart with memories of Chengdu\'s unique charm.',
      highlights: ['Wenshu Monastery', 'Farewell lunch', 'Departure'],
    },
  ],
};

const GALLERY_IMAGES = [
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero1-4G32VK9iXnY5zQXxnmzmtg.webp',
    caption: 'Chengdu landscape',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-hero2-hV8GsfHpqwcv825ZiyPDip.webp',
    caption: 'Local market',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-ceremony-HSmT7ziKwEUdErnGtbJjRq.webp',
    caption: 'Tea ceremony',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-village-XCJXXi79XhsGbf6u82fzL8.webp',
    caption: 'Village experience',
  },
  {
    src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663630009306/chKZ3ASBY6hN7TJJn2LUVH/tea-mountains-processing-PgZjyE8TtmUCWv49iGQYJo.webp',
    caption: 'Cultural immersion',
  },
];

export default function ItineraryTemplate() {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  const handleNextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  return (
    <div style={{ background: '#fafafa' }}>
      <Navigation />

      {/* Hero Section */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            {/* Left: Info */}
            <div>
              <h1 style={{ fontSize: '48px', fontWeight: '300', letterSpacing: '0.05em', lineHeight: '1.2', marginBottom: '24px', color: '#1a1a1a' }}>
                {SAMPLE_ITINERARY.name}
              </h1>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666', marginBottom: '32px' }}>
                {SAMPLE_ITINERARY.description}
              </p>

              {/* Key Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Clock size={18} style={{ color: '#F5569B' }} />
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Duration</span>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a' }}>{SAMPLE_ITINERARY.days} days</p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <DollarSign size={18} style={{ color: '#F5569B' }} />
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Price</span>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a' }}>{SAMPLE_ITINERARY.price}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={18} style={{ color: '#F5569B' }} />
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Group Size</span>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a' }}>Up to {SAMPLE_ITINERARY.maxPeople} people</p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <MapPin size={18} style={{ color: '#F5569B' }} />
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>Difficulty</span>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a1a', textTransform: 'capitalize' }}>{SAMPLE_ITINERARY.difficulty}</p>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {SAMPLE_ITINERARY.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Image */}
            <div>
              <img
                src={SAMPLE_ITINERARY.coverImage}
                alt={SAMPLE_ITINERARY.name}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section style={{ background: '#fff', padding: '60px 40px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '0.05em', marginBottom: '40px', color: '#1a1a1a' }}>
            Gallery
          </h2>

          {/* Carousel */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                background: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <img
                src={GALLERY_IMAGES[currentImageIdx].src}
                alt={GALLERY_IMAGES[currentImageIdx].caption}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Navigation Buttons */}
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)')}
              >
                <ChevronLeft size={24} color="#1a1a1a" />
              </button>

              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)')}
              >
                <ChevronRight size={24} color="#1a1a1a" />
              </button>

              {/* Caption */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {GALLERY_IMAGES[currentImageIdx].caption}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {GALLERY_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: idx === currentImageIdx ? '#F5569B' : '#ddd',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Day-by-Day Section */}
      <section style={{ background: '#fff', padding: '60px 40px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '0.05em', marginBottom: '40px', color: '#1a1a1a' }}>
            Day-by-Day Itinerary
          </h2>

          {SAMPLE_ITINERARY.dayByDay.map((dayInfo) => (
            <div
              key={dayInfo.day}
              style={{
                marginBottom: '40px',
                paddingBottom: '40px',
                borderBottom: dayInfo.day === SAMPLE_ITINERARY.dayByDay.length ? 'none' : '1px solid #e0e0e0',
              }}
            >
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Day Number */}
                <div
                  style={{
                    minWidth: '80px',
                    fontSize: '48px',
                    fontWeight: '300',
                    color: '#F5569B',
                    lineHeight: '1',
                  }}
                >
                  Day {dayInfo.day}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '12px', color: '#1a1a1a' }}>
                    {dayInfo.title}
                  </h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#666', marginBottom: '16px' }}>
                    {dayInfo.description}
                  </p>

                  {/* Highlights */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {dayInfo.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          background: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: '#f5f5f5', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '0.05em', marginBottom: '24px', color: '#1a1a1a' }}>
            Ready to Explore?
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            This is a template itinerary. Create your own custom itinerary in the admin panel to showcase your unique travel experiences.
          </p>
          <button
            style={{
              padding: '14px 40px',
              background: '#F5569B',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E63E8A')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F5569B')}
          >
            Create Itinerary
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
