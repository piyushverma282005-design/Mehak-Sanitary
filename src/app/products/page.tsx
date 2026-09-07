import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductCatalogueClient } from '@/components/products/ProductCatalogueClient';
import { getCachedProducts } from '@/lib/productsCache';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Products Catalogue | Mehak Sanitary Hardware',
  description:
    'Browse the complete sanitary hardware product range by Mehak — health faucets, waste couplings, floor jalis, sink strainers, jet sprays, waste pipes, and bathroom accessories.',
};

export default async function ProductsPage() {
  const products = await getCachedProducts();

  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-500 font-medium">
          Loading Sanitary Hardware Catalogue...
        </div>
      }
    >
      <ProductCatalogueClient initialProducts={products} />
    </Suspense>
  );
}
