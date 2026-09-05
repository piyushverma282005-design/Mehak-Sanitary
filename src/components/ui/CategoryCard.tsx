'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/types';
import { Card } from './Card';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

export interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="group flex flex-col h-full bg-white">
      {/* Easily swappable image container or neutral category placeholder */}
      <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-100">
        {category.imageUrl && !imgError ? (
          <>
            <Image
              src={category.imageUrl}
              alt={`Mehak ${category.name} Sanitary Hardware`}
              fill
              unoptimized={true}
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </>
        ) : (
          <ProductImagePlaceholder
            productName={category.name}
            categoryName={category.name}
            aspectRatio="portrait"
            className="group-hover:scale-102 transition-transform duration-300"
          />
        )}
        <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-xs z-10">
          {category.name}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
          {category.shortDescription}
        </p>

        <Link
          href={`/products?category=${category.id}`}
          className="inline-flex items-center text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors gap-1.5 mt-auto pt-2 border-t border-slate-100"
        >
          <span>View Products</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
};
