import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsData } from '@/data/products';
import { ProductDetailView } from '@/components/products/ProductDetailView';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehak-sanitary.com';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Product Not Found | Mehak Sanitary Hardware',
    };
  }

  const productUrl = `${siteUrl}/products/${product.slug}`;

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
          url: product.image || '/images/mehak-logo.png',
          alt: product.name,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  return productsData.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

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
    image: `${siteUrl}${product.image || '/images/mehak-logo.png'}`,
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
