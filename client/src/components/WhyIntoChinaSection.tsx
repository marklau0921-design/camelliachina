import React from 'react';
import { Award, Lightbulb, CreditCard, Phone, Users } from 'lucide-react';

/**
 * Why Into China Section
 * Design: Five feature cards with icons, titles, and descriptions
 * Layout: Centered title with 5-column grid of feature cards
 * Features: Clean, minimal design with icon-based visual hierarchy
 */

interface FeatureCard {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    id: 1,
    icon: <Award className="w-12 h-12 text-gray-700" strokeWidth={1.5} />,
    title: 'Award-winning planners',
    description: '',
  },
  {
    id: 2,
    icon: <Lightbulb className="w-12 h-12 text-gray-700" strokeWidth={1.5} />,
    title: 'No-obligation quotes',
    description: '',
  },
  {
    id: 3,
    icon: <CreditCard className="w-12 h-12 text-gray-700" strokeWidth={1.5} />,
    title: 'No planning fees',
    description: '',
  },
  {
    id: 4,
    icon: <Phone className="w-12 h-12 text-gray-700" strokeWidth={1.5} />,
    title: '24/7 on the ground support',
    description: '',
  },
  {
    id: 5,
    icon: <Users className="w-12 h-12 text-gray-700" strokeWidth={1.5} />,
    title: 'Expert private guides',
    description: '',
  },
];

export default function WhyIntoChinaSection() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden" style={{backgroundColor: '#fafafa'}}>
      <div className="container max-w-7xl mx-auto px-4" style={{paddingTop: '64px', paddingBottom: '64px'}}>
        {/* Section Title */}
        <div className="flex flex-col items-center justify-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-black text-center uppercase font-semibold" style={{fontSize: '28px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em'}}>
            WHY WAYSEEK?
          </h2>
          <div className="w-16 h-px bg-black mt-6"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-6 flex items-center justify-center">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-sans text-base md:text-lg mb-3 font-semibold tracking-wide" style={{color: '#666666'}}>
                {feature.title}
              </h3>


            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
