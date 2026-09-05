import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Card } from './Card';
import { Button } from './Button';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { Eye, PhoneCall } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onEnquire?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEnquire }) => {
  return (
    <Card className="group flex flex-col h-full bg-white border border-slate-200/90 hover:border-slate-300 transition-all duration-300">
      {/* Product Image Area / Neutral Placeholder */}
      <Link href={`/products/${product.slug}`} className="relative block w-full overflow-hidden">
        {product.image ? (
          <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-100">
            <Image
              src={product.image}
              alt={`Mehak ${product.name}`}
              fill
              loading="lazy"
              unoptimized={product.image.startsWith('data:') || product.image.startsWith('http')}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <ProductImagePlaceholder
            productName={product.name}
            categoryName={product.categoryName}
            aspectRatio="portrait"
            className="group-hover:scale-102 transition-transform duration-300"
          />
        )}

        <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs">
          {product.categoryName}
        </div>
      </Link>

      {/* Product Information Body */}
      <div className="p-5 flex flex-col flex-1">
        {product.material && (
          <div className="text-[11px] text-slate-500 font-semibold mb-1 tracking-wider uppercase">
            {product.material}
          </div>
        )}

        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
          {product.shortDescription}
        </p>

        {/* Enquiry Notice Badge */}
        <div className="mb-4 text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200/80">
          Contact us for product details
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5 mt-auto">
          <Button
            variant="secondary"
            size="sm"
            href={`/products/${product.slug}`}
            icon={<Eye className="w-3.5 h-3.5" />}
            className="flex-1 text-xs"
          >
            View Details
          </Button>

          {onEnquire && (
            <Button
              variant="metallic"
              size="sm"
              onClick={() => onEnquire(product)}
              icon={<PhoneCall className="w-3.5 h-3.5" />}
              className="flex-1 text-xs"
            >
              Enquire Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
