import { prisma } from '@/lib/prisma';
import { productsData as fallbackProducts } from '@/data/products';
import { Product, ProductCategory, ProductSpecification } from '@/types';
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

    if (products) {
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.slug as ProductCategory,
        categoryName: p.category.name,
        shortDescription: p.shortDescription || '',
        description: p.description || '',
        material: p.material || undefined,
        featured: p.featured,
        isFeatured: p.featured,
        available: p.available,
        image: p.image,
        gallery: p.gallery || [],
        specifications: (p.specifications as unknown as ProductSpecification[]) || [],
      }));
    }
  } catch (error) {
    console.error('Error fetching products from DB in cache helper:', error);
    return fallbackProducts;
  }

  return [];
}

export const getCachedProducts = unstable_cache(
  fetchProductsFromDb,
  ['all-products-list'],
  {
    revalidate: 60,
    tags: ['products'],
  }
);

async function fetchProductBySlugFromDb(rawSlug: string): Promise<Product | null> {
  if (!rawSlug) return null;

  const decodedSlug = decodeURIComponent(rawSlug).trim();
  const normalizedSlug = decodedSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: decodedSlug },
          { slug: normalizedSlug },
          { slug: { equals: decodedSlug, mode: 'insensitive' } },
          { id: decodedSlug },
        ],
      },
      include: { category: true },
    });

    if (dbProduct) {
      return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        category: dbProduct.category.slug as ProductCategory,
        categoryName: dbProduct.category.name,
        shortDescription: dbProduct.shortDescription || '',
        description: dbProduct.description,
        material: dbProduct.material || undefined,
        image: dbProduct.image,
        gallery: dbProduct.gallery || [],
        specifications: (dbProduct.specifications as unknown as ProductSpecification[]) || [],
        isFeatured: dbProduct.featured,
        featured: dbProduct.featured,
        available: dbProduct.available,
      };
    }
  } catch (error) {
    console.error('Error fetching product by slug from DB:', error);
  }

  const staticProduct = fallbackProducts.find(
    (p) =>
      p.slug.toLowerCase() === decodedSlug.toLowerCase() ||
      p.slug.toLowerCase() === normalizedSlug ||
      p.slug === rawSlug ||
      p.id === decodedSlug
  );
  return staticProduct || null;
}

const getCachedProductInternal = unstable_cache(
  async (slug: string) => fetchProductBySlugFromDb(slug),
  ['product-by-slug-cache'],
  {
    revalidate: 60,
    tags: ['products'],
  }
);

export const getCachedProductBySlug = async (slug: string): Promise<Product | null> => {
  const cached = await getCachedProductInternal(slug);
  if (cached) return cached;
  // Fallback direct DB fetch in case product was just created and cache hasn't hydrated
  return fetchProductBySlugFromDb(slug);
};
