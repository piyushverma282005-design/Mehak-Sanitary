import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { CategoryCard } from '../ui/CategoryCard';
import { categoriesData } from '@/data/categories';

export const CategorySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Core Ranges"
          title="Explore Our Products"
          description="Discover our specialized product lines designed for modern residential, commercial, and institutional bathroom requirements."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoriesData.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};
