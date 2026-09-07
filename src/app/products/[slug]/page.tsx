import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsData } from '@/data/products';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { prisma } from '@/lib/prisma';
import { Product } from '@/types';

import { cache } from 'react';
import { getCachedProductBySlug } from '@/lib/productsCache';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehak-sanitary.com';

const getProduct = cache(async (slug: string): Promise<Product | null> => {
  return getCachedProductBySlug(slug);
});

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Mehak Sanitary Hardware',
    };
  }

  const productUrl = `${siteUrl}/products/${product.slug}`;
  const ogImageUrl = product.image
    ? product.image.startsWith('http') || product.image.startsWith('data:')
      ? product.image
      : `${siteUrl}${product.image}`
    : `${siteUrl}/images/mehak-logo.png`;

  return {
    title: `${product.name} | Mehak Sanitary Hardware`,
    description: `${product.name} (${product.categoryName}) manufactured by Hari Har Industries under brand Mehak. Contact us for product details and dealer enquiries.`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | Mehak Sanitary Hardware`,
      description: product.shortDescription,
      url: productUrl,
      siteName: 'Mehak Sanitary Hardware',
      images: [
        {
          url: ogImageUrl,
          alt: product.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  try {
    const dbProducts = await prisma.product.findMany({ select: { slug: true } });
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => ({ slug: p.slug }));
    }
  } catch (error) {
    console.error('Error generating static params from DB:', error);
  }
  return productsData.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const jsonLdImage = product.image
    ? product.image.startsWith('http') || product.image.startsWith('data:')
      ? product.image
      : `${siteUrl}${product.image}`
    : `${siteUrl}/images/mehak-logo.png`;

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || `${product.name} - Mehak Sanitary Hardware`,
    category: product.categoryName,
    brand: {
      '@type': 'Brand',
      name: 'Mehak',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Hari Har Industries',
    },
    image: jsonLdImage,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
