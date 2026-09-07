import { prisma } from '@/lib/prisma';
import { productsData as fallbackProducts } from '@/data/products';
import { Product } from '@/types';
import { unstable_cache } from 'next/cache';

async function fetchProductsFromDb(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        shortDescription: true,
        description: true,
        material: true,
        featured: true,
        available: true,
        image: true,
        gallery: true,
        specifications: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (products && products.length > 0) {
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.slug as any,
        categoryName: p.category.name,
        shortDescription: p.shortDescription || '',
        description: p.description || '',
        material: p.material || undefined,
        featured: p.featured,
        isFeatured: p.featured,
        available: p.available,
        image: p.image,
        gallery: p.gallery || [],
        specifications: (p.specifications as any) || [],
      }));
    }
  } catch (error) {
    console.error('Error fetching products from DB in cache helper:', error);
  }

  return fallbackProducts;
}

export const getCachedProducts = unstable_cache(
  fetchProductsFromDb,
  ['all-products-list'],
  {
    revalidate: 60,
    tags: ['products'],
  }
);

async function fetchProductBySlugFromDb(slug: string): Promise<Product | null> {
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
    console.error('Error fetching product by slug from DB:', error);
  }

  const staticProduct = fallbackProducts.find((p) => p.slug === slug);
  return staticProduct || null;
}

export const getCachedProductBySlug = (slug: string) => {
  return unstable_cache(
    () => fetchProductBySlugFromDb(slug),
    [`product-${slug}`],
    {
      revalidate: 60,
      tags: ['products', `product-${slug}`],
    }
  )();
};
