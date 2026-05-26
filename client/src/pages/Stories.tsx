import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { ArrowRight } from 'lucide-react';

/**
 * Stories Page
 * Design: Showcase travel stories and guest experiences
 * Data: Dynamically loaded from backend CMS
 */

interface Story {
  id: number;
  title: string;
  content: string;
  author?: string;
  image?: string;
  publishedAt?: string;
  createdAt: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Fetch stories from backend
  const { data: storiesData } = trpc.cms.listStories.useQuery();

  useEffect(() => {
    if (storiesData && storiesData.length > 0) {
      setStories(storiesData);
      setSelectedStory(storiesData[0]);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [storiesData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading stories...</p>
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
            Guest Stories
          </h1>
          <p className="font-sans text-lg md:text-xl max-w-2xl opacity-90">
            Discover the unforgettable journeys and transformative experiences of our guests
          </p>
        </div>
      </section>

      {/* Stories Section */}
      <section className="flex-1 bg-background py-16">
        <div className="container max-w-7xl mx-auto px-4">
          {stories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No stories available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stories List - Left Column */}
              <div className="lg:col-span-1">
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {stories.map((story) => (
                    <button
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                        selectedStory?.id === story.id
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                    >
                      <h3 className="font-display text-lg font-normal mb-2">
                        {story.title}
                      </h3>
                      {story.author && (
                        <p className="font-sans text-sm opacity-75">
                          By {story.author}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Story - Right Column */}
              <div className="lg:col-span-2">
                {selectedStory && (
                  <div className="space-y-6">
                    {/* Story Image */}
                    {selectedStory.image && (
                      <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={selectedStory.image}
                          alt={selectedStory.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Story Title */}
                    <div>
                      <h2 className="font-display text-4xl font-normal text-black mb-4">
                        {selectedStory.title}
                      </h2>
                      <div className="flex items-center gap-4 text-gray-600">
                        {selectedStory.author && (
                          <span className="font-sans text-sm">
                            By <strong>{selectedStory.author}</strong>
                          </span>
                        )}
                        {selectedStory.publishedAt && (
                          <span className="font-sans text-sm">
                            {new Date(selectedStory.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Story Content */}
                    <div className="prose prose-lg max-w-none">
                      <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedStory.content}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="pt-8 border-t border-gray-200">
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-300">
                        Share Your Story
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-normal mb-6">
            Ready to Create Your Own Story?
          </h2>
          <p className="font-sans text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join our community of travelers and experience the magic of China like never before.
          </p>
          <button className="px-8 py-3 bg-white text-black font-sans text-sm font-normal tracking-wider uppercase rounded hover:bg-gray-200 transition-colors duration-300 active:scale-95">
            Start Your Journey
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
