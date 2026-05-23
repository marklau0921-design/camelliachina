import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MapView } from '@/components/Map';

/**
 * Destinations Page
 * Design: White background with left content and right map (2/3 width)
 */

interface DestinationDetail {
  id: number;
  name: string;
  region: string;
  description: string;
  lat: number;
  lng: number;
}

const destinationDetails: DestinationDetail[] = [
  {
    id: 1,
    name: 'The Great Wall',
    region: 'Beijing & Hebei',
    description: 'Stretching over 13,000 miles, the Great Wall is humanity\'s most ambitious architectural achievement. Walk along ancient ramparts with breathtaking mountain vistas, explore watchtowers that have guarded empires, and immerse yourself in centuries of history.',
    lat: 40.4319,
    lng: 116.5704,
  },
  {
    id: 2,
    name: 'Guilin & Yangshuo',
    region: 'Guangxi',
    description: 'Emerge into a landscape of towering karst peaks rising from emerald waters. This UNESCO World Heritage site has inspired artists and poets for millennia. Experience traditional cormorant fishing, bamboo raft journeys, and the timeless beauty of rural China.',
    lat: 25.2830,
    lng: 110.2965,
  },
  {
    id: 3,
    name: 'Forbidden City',
    region: 'Beijing',
    description: 'Step into the heart of imperial China. This sprawling palace complex served as home to emperors for nearly 500 years. With nearly 1,000 buildings, intricate courtyards, and priceless artifacts, the Forbidden City reveals the grandeur and complexity of Chinese imperial life.',
    lat: 39.9163,
    lng: 116.3972,
  },
  {
    id: 4,
    name: 'West Lake',
    region: 'Hangzhou',
    description: 'Encircled by misty mountains and classical gardens, West Lake embodies the essence of Chinese aesthetic philosophy. Stroll along ancient causeways, visit serene temples, and experience the refined culture that has flourished here for over 1,000 years.',
    lat: 30.2741,
    lng: 120.1551,
  },
];

export default function Destinations() {
  const [selectedDestination, setSelectedDestination] = useState(destinationDetails[0]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EF]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full bg-[#F5F3EF] py-16 mt-20">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-normal text-black mb-4">
            Destinations
          </h1>
          <p className="font-sans text-lg text-gray-600 max-w-2xl">
            Discover China's most enchanting regions and iconic landmarks
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 bg-[#F5F3EF]">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Destination List */}
                <div>
                  <h2 className="font-display text-2xl font-normal text-black mb-6">
                    Select Destination
                  </h2>
                  <div className="space-y-3">
                    {destinationDetails.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => setSelectedDestination(dest)}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                          selectedDestination.id === dest.id
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        <p className="font-sans text-sm uppercase tracking-widest opacity-75 mb-1">
                          {dest.region}
                        </p>
                        <p className="font-display text-lg font-normal">
                          {dest.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Destination Details */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-display text-xl font-normal text-black mb-4">
                    {selectedDestination.name}
                  </h3>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed">
                    {selectedDestination.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Map - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="w-full h-96 lg:h-full min-h-[600px] rounded-lg overflow-hidden shadow-lg">
                <MapView
                  initialCenter={{
                    lat: selectedDestination.lat,
                    lng: selectedDestination.lng,
                  }}
                  initialZoom={10}
                  onMapReady={(map: google.maps.Map) => {
                    // Add marker for selected destination
                    if (window.google?.maps?.Marker) {
                      new window.google.maps.Marker({
                        position: {
                          lat: selectedDestination.lat,
                          lng: selectedDestination.lng,
                        },
                        map: map,
                        title: selectedDestination.name,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F5F3EF] border-t border-gray-200 py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-normal text-black mb-6">
            Ready to Explore?
          </h2>
          <p className="font-sans text-gray-600 mb-8 max-w-2xl mx-auto">
            Our travel designers will craft a personalized itinerary combining your favorite destinations with exclusive experiences.
          </p>
          <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-[#F5F3EF] hover:text-black transition-all duration-300 active:scale-95 active:shadow-lg">
            Get in Touch
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
