import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export interface ProductImagePlaceholderProps {
  productName: string;
  categoryName: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const ProductImagePlaceholder: React.FC<ProductImagePlaceholderProps> = ({
  productName,
  categoryName,
  className = '',
  aspectRatio = 'square',
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-4/3',
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Ambient background accent shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-slate-700/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-slate-800/30 rounded-full blur-2xl pointer-events-none" />

      {/* Grid line subtle watermark overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Official Logo Brand Mark Badge */}
        <div className="relative w-14 h-14 rounded-2xl bg-black border border-slate-700/80 overflow-hidden flex items-center justify-center mb-3 shadow-lg">
          <Image
            src="/images/mehak-logo.png"
            alt="Mehak - Hari Har Industries"
            width={48}
            height={48}
            className="object-contain p-1"
          />
        </div>

        {/* Product & Brand indicator */}
        <div className="space-y-1 max-w-[85%]">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            {categoryName}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
            {productName}
          </h4>
        </div>

        {/* Placeholder Status Badge */}
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Mehak Hardware Fitting</span>
        </div>
      </div>
    </div>
  );
};
