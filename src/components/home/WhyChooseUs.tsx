import React from 'react';
import {
  ShieldCheck,
  Layers,
  Grid,
  Headphones,
  Truck,
  HeartHandshake,
  LucideProps,
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { businessFeatures } from '@/data/features';

const iconMap: Record<string, React.FC<LucideProps>> = {
  ShieldCheck,
  Layers,
  Grid,
  Headphones,
  Truck,
  HeartHandshake,
};

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Our Strengths"
          title="Why Choose Mehak"
          description="Built on engineering consistency, material integrity, and dependable trade relationships for dealers, contractors, and customers."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessFeatures.map((feature) => {
            const IconComponent = iconMap[feature.iconName] || ShieldCheck;
            return (
              <Card key={feature.id} className="p-8 flex flex-col h-full bg-slate-50/50">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-sm">
                  <IconComponent className="w-6 h-6 text-slate-100" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
