'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductFilter, FilterCategoryItem } from '@/components/products/ProductFilter';
import { ProductGrid } from '@/components/products/ProductGrid';
import { EnquiryModal } from '@/components/ui/EnquiryModal';
import { Product } from '@/types';

export interface ProductCatalogueClientProps {
  initialProducts: Product[];
  categories: FilterCategoryItem[];
}

export function ProductCatalogueClient({ initialProducts, categories }: ProductCatalogueClientProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const handleEnquire = (product: Product) => {
    setSelectedProduct(product);
    setIsEnquiryOpen(true);
  };

  // Find active category object if selectedCategory is passed as UUID, slug, or name
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return null;
    return categories.find(
      (c) =>
        c.id === selectedCategory ||
        c.slug === selectedCategory ||
        c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [categories, selectedCategory]);

  // Real-time filter across product name, category, or description
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        !selectedCategory ||
        product.category === selectedCategory ||
        (product as any).categoryId === selectedCategory ||
        product.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        (activeCategoryObj &&
          (product.category === activeCategoryObj.slug ||
           (product as any).categoryId === activeCategoryObj.id ||
           product.categoryName?.toLowerCase() === activeCategoryObj.name.toLowerCase()));

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(query)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory, activeCategoryObj]);

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

        {/* Search & Dynamic Category Filter */}
        <ProductFilter
          categories={categories}
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
