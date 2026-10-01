import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount: number;
}

async function fetchCategoriesFromDb(): Promise<CategoryItem[]> {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (categories) {
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        productCount: c._count.products,
      }));
    }
  } catch (error) {
    console.error('Error fetching categories from DB in categoriesCache:', error);
  }

  return [];
}

export const getCachedCategories = unstable_cache(
  fetchCategoriesFromDb,
  ['all-categories-list'],
  {
    revalidate: 60,
    tags: ['categories'],
  }
);
