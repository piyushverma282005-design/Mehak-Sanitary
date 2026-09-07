'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductGrid } from '@/components/products/ProductGrid';
import { EnquiryModal } from '@/components/ui/EnquiryModal';
import { Product } from '@/types';

export interface ProductCatalogueClientProps {
  initialProducts: Product[];
}

export function ProductCatalogueClient({ initialProducts }: ProductCatalogueClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

  const [products] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleEnquire = (product: Product) => {
    setSelectedProduct(product);
    setIsEnquiryOpen(true);
  };

  // Real-time filter across product name, category, or description
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Product Catalogue"
          title="Sanitary Hardware Collection"
          description="Explore our range of sanitary hardware and bathroom fittings from Mehak."
          align="center"
        />

        {/* Search & Category Filter */}
        <ProductFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalResultsCount={filteredProducts.length}
        />

        {/* Products Catalogue Grid */}
        <ProductGrid
          products={filteredProducts}
          onEnquire={handleEnquire}
          onResetFilters={handleResetFilters}
        />
      </div>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => {
          setIsEnquiryOpen(false);
          setSelectedProduct(null);
        }}
        productName={selectedProduct?.name}
        defaultCategory={selectedProduct?.category}
      />
    </div>
  );
}
