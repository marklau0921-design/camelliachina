import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowRight, Calendar } from 'lucide-react';

/**
 * Inspiration Page
 * Design: Travel stories, guides, and inspiration content
 */

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Top 5 Luxury Wellness Retreats in China',
    excerpt: 'Discover the most exclusive wellness destinations where ancient healing traditions meet modern luxury. From mountain temples to lakeside spas, rejuvenate your mind and body.',
    category: 'Wellness',
    date: 'January 2026',
    readTime: '8 min read',
    image: '/manus-storage/lQarUKpI71rP_a45c4e2d.avif',
  },
  {
    id: 2,
    title: 'The Art of Slow Travel in China',
    excerpt: 'Learn how to travel mindfully through China, taking time to connect with local communities, savor regional cuisines, and truly experience the destinations you visit.',
    category: 'Travel Tips',
    date: 'December 2025',
    readTime: '10 min read',
    image: '/manus-storage/cKNNGGcYAuYR_67291337.avif',
  },
  {
    id: 3,
    title: 'Culinary Adventures Across Regions',
    excerpt: 'A gastronomic journey through China\'s diverse culinary landscape. Explore regional specialties, meet master chefs, and discover the stories behind iconic dishes.',
    category: 'Gastronomy',
    date: 'November 2025',
    readTime: '12 min read',
    image: '/manus-storage/mwMaZxOiIbSC_6316bb33.avif',
  },
  {
    id: 4,
    title: 'Hidden Gems: Off-the-Beaten-Path Destinations',
    excerpt: 'Venture beyond the famous landmarks to discover China\'s lesser-known treasures. Pristine landscapes, authentic villages, and unique cultural experiences await.',
    category: 'Destinations',
    date: 'October 2025',
    readTime: '9 min read',
    image: '/manus-storage/xU3Z1k1TTXSG_efe4d129.avif',
  },
  {
    id: 5,
    title: 'Connecting with Local Artisans',
    excerpt: 'Meet the craftspeople keeping China\'s ancient traditions alive. From silk weaving to porcelain painting, discover the artistry behind traditional crafts.',
    category: 'Culture',
    date: 'September 2025',
    readTime: '7 min read',
    image: '/manus-storage/fF6fvDhSO1V4_417b505c.avif',
  },
  {
    id: 6,
    title: 'Photography Guide: Capturing China\'s Beauty',
    excerpt: 'Essential tips and techniques for photographing China\'s most stunning landscapes. Learn from professional photographers and discover the best locations and times.',
    category: 'Photography',
    date: 'August 2025',
    readTime: '11 min read',
    image: '/manus-storage/MUKm78KwPQEA_52ca0f8f.avif',
  },
];

export default function Inspiration() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full h-96 mt-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/manus-storage/7QgucNsF5n2h_efe4d129.avif'), url('/manus-storage/7QgucNsF5n2h_efe4d129.avif')`
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-normal mb-4 tracking-tight">
            Inspiration
          </h1>
          <p className="font-sans text-lg md:text-xl max-w-2xl opacity-90">
            Travel stories, guides, and insider tips from our team
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="section-padding bg-black border-b border-gray-800">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 overflow-hidden rounded-lg">
              <img
                src={articles[0].image}
                alt={articles[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <p className="font-sans text-xs tracking-widest text-primary uppercase mb-2">
                {articles[0].category}
              </p>
              <h2 className="font-heading-lg text-foreground mb-4">{articles[0].title}</h2>
              <p className="font-body text-foreground/80 mb-6">{articles[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-foreground/60 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{articles[0].date}</span>
                </div>
                <span>•</span>
                <span>{articles[0].readTime}</span>
              </div>
              <button className="btn-luxury-solid inline-flex items-center gap-2">
                Read Article
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section-padding bg-black border-t border-gray-800">
        <div className="container">
          <h2 className="font-heading-lg text-primary mb-12">Latest Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((article) => (
              <article key={article.id} className="group flex flex-col">
                <div className="relative h-64 overflow-hidden rounded-lg mb-6">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-sans text-xs tracking-widest text-primary uppercase mb-2">
                  {article.category}
                </p>
                <h3 className="font-heading-sm text-foreground mb-3 group-hover:text-primary transition-colors flex-grow">
                  {article.title}
                </h3>
                <p className="font-body text-foreground/70 text-sm mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-foreground/60 mb-4">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
                <button className="btn-luxury inline-flex items-center gap-2 text-sm">
                  Read
                  <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-black border-t border-gray-800">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="font-heading-lg text-primary mb-4">Stay Inspired</h2>
            <p className="font-body text-foreground/70">
              Subscribe to our newsletter for exclusive travel stories, insider tips, and special offers.
            </p>
          </div>

          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="btn-luxury-solid px-8"
            >
              Subscribe
            </button>
          </form>

          <p className="text-xs text-foreground/60 text-center mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-black border-t border-gray-800">
        <div className="container">
          <h2 className="font-heading-lg text-primary mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'Wellness',
              'Travel Tips',
              'Gastronomy',
              'Destinations',
              'Culture',
              'Photography',
            ].map((category) => (
              <button
                key={category}
                className="p-4 border border-gray-700 rounded-lg hover:border-white hover:bg-[#F5F3EF]/5 transition-all text-center font-sans text-sm text-white"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
