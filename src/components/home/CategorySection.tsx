import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { CategoryCard } from '../ui/CategoryCard';
import { getCachedCategories } from '@/lib/categoriesCache';
import { Category } from '@/types';

export const CategorySection: React.FC = async () => {
  const dbCategories = await getCachedCategories();

  if (!dbCategories || dbCategories.length === 0) {
    return null;
  }

  const categories: Category[] = dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    shortDescription: cat.description || `High quality ${cat.name} hardware by Mehak.`,
    description: cat.description || `High quality ${cat.name} hardware by Mehak.`,
    featured: true,
  }));

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
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};
