import React from 'react';
import { Product } from '@/types';
import { ProductCard } from '../ui/ProductCard';
import { SearchX } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ProductGridProps {
  products: Product[];
  onEnquire: (product: Product) => void;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onEnquire,
  onResetFilters,
}) => {
  if (products.length === 0) {
    return (
      <div className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto my-8">
        <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No products found</h3>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          We couldn't find any products matching your current search query or category filter.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="md" onClick={onResetFilters}>
            Clear Search & Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onEnquire={onEnquire} />
      ))}
    </div>
  );
};
