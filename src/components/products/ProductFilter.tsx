'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { categoriesData } from '@/data/categories';

export interface ProductFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  totalResultsCount: number;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalResultsCount,
}) => {
  return (
    <div className="space-y-6 mb-10">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name or category (e.g., 'faucet', 'waste', 'jali')..."
            className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base bg-white border border-slate-300 rounded-xl shadow-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Selection Tabs & Mobile Dropdown */}
      <div>
        {/* Mobile View: Compact Dropdown */}
        <div className="sm:hidden flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesData.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop & Tablet View: Horizontally Scrollable Pills */}
        <div className="hidden sm:flex items-center justify-center flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 border cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Products
          </button>
          {categoriesData.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 border cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Filter Summary Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
        <div>
          Showing <span className="font-bold text-slate-900">{totalResultsCount}</span> product
          {totalResultsCount === 1 ? '' : 's'}
        </div>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('all');
            }}
            className="text-slate-700 font-semibold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
