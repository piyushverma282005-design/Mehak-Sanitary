import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsData } from '@/data/products';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { prisma } from '@/lib/prisma';
import { Product } from '@/types';

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehak-sanitary.com';

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (dbProduct) {
      return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        category: dbProduct.category.slug as any,
        categoryName: dbProduct.category.name,
        shortDescription: dbProduct.shortDescription || '',
        description: dbProduct.description,
        material: dbProduct.material || undefined,
        image: dbProduct.image,
        gallery: dbProduct.gallery || [],
        specifications: (dbProduct.specifications as any) || [],
        isFeatured: dbProduct.featured,
        featured: dbProduct.featured,
        available: dbProduct.available,
      };
    }
  } catch (error) {
    console.error('Error fetching product from DB by slug:', error);
  }

  // Fallback to static productsData
  const staticProduct = productsData.find((p) => p.slug === slug);
  return staticProduct || null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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
  const product = await getProductBySlug(slug);

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
