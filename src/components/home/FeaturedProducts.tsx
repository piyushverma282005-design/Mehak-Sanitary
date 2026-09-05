'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { ProductCard } from '../ui/ProductCard';
import { Button } from '../ui/Button';
import { EnquiryModal } from '../ui/EnquiryModal';
import { productsData as initialProducts } from '@/data/products';
import { Product } from '@/types';
import { ArrowRight } from 'lucide-react';

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.error('Featured products fetch error:', err));
  }, []);

  const handleEnquire = (product: Product) => {
    setSelectedProduct(product);
    setIsEnquiryOpen(true);
  };

  const featuredProducts = React.useMemo(() => {
    const featuredList = products.filter((p) => p.isFeatured || p.featured);
    return (featuredList.length > 0 ? featuredList : products).slice(0, 6);
  }, [products]);

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeading
            badge="Product Showcase"
            title="Built for Modern Bathrooms"
            description="Explore our highlighted sanitary hardware fittings crafted for durability, anti-clog performance, and smooth water control."
            align="left"
            className="mb-0"
          />
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              size="md"
              href="/products"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              View Full Catalogue
            </Button>
          </div>
        </div>

        {/* Centralized Featured Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEnquire={handleEnquire}
            />
          ))}
        </div>
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
    </section>
  );
};
