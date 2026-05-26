import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { Play } from 'lucide-react';

/**
 * Media Library Page
 * Design: Showcase photos and videos from destinations
 * Data: Dynamically loaded from backend CMS
 */

interface MediaItem {
  id: number;
  type: 'image' | 'video';
  title?: string;
  url: string;
  thumbnail?: string;
  description?: string;
}

export default function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Fetch videos from backend
  const { data: videosData } = trpc.cms.listVideos.useQuery();

  useEffect(() => {
    if (videosData && videosData.length > 0) {
      // Transform videos to media items
      const videoItems: MediaItem[] = videosData.map((video: any) => ({
        id: video.id,
        type: 'video',
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        description: video.description,
      }));
      setMediaItems(videoItems);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [videosData]);

  const filteredMedia = filterType === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === filterType);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading media library...</p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full bg-black text-white py-24 mt-20">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="font-display text-5xl md:text-6xl font-normal mb-6 tracking-tight">
            Media Library
          </h1>
          <p className="font-sans text-lg md:text-xl max-w-2xl opacity-90">
            Explore the breathtaking landscapes and unforgettable moments from our destinations
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-2 rounded font-sans text-sm font-normal tracking-wider uppercase transition-all duration-300 ${
                filterType === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              All Media
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-6 py-2 rounded font-sans text-sm font-normal tracking-wider uppercase transition-all duration-300 ${
                filterType === 'image'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-6 py-2 rounded font-sans text-sm font-normal tracking-wider uppercase transition-all duration-300 ${
                filterType === 'video'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="flex-1 bg-background py-16">
        <div className="container max-w-7xl mx-auto px-4">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No media available in this category.</p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredMedia.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="group relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={item.type === 'video' ? item.thumbnail || item.url : item.url}
                      alt={item.title || 'Media item'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                        <Play size={48} className="text-white" fill="white" />
                      </div>
                    )}
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="font-sans text-white text-sm font-normal">
                          {item.title}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Media Detail */}
              {selectedMedia && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedMedia(null)}
                      className="absolute top-4 right-4 text-gray-600 hover:text-black transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Media Content */}
                    <div className="p-8">
                      {selectedMedia.type === 'video' ? (
                        <div className="relative w-full pb-[56.25%] mb-6">
                          <iframe
                            className="absolute inset-0 w-full h-full rounded-lg"
                            src={selectedMedia.url}
                            title={selectedMedia.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <img
                          src={selectedMedia.url}
                          alt={selectedMedia.title}
                          className="w-full rounded-lg mb-6"
                        />
                      )}

                      {selectedMedia.title && (
                        <h2 className="font-display text-2xl font-normal text-black mb-4">
                          {selectedMedia.title}
                        </h2>
                      )}

                      {selectedMedia.description && (
                        <p className="font-sans text-gray-700 leading-relaxed">
                          {selectedMedia.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-normal mb-6">
            Inspired by What You See?
          </h2>
          <p className="font-sans text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Let our travel designers create a custom itinerary based on your favorite destinations and experiences.
          </p>
          <button className="px-8 py-3 bg-white text-black font-sans text-sm font-normal tracking-wider uppercase rounded hover:bg-gray-200 transition-colors duration-300 active:scale-95">
            Plan Your Trip
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
