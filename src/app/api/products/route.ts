import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAdminSession } from '@/lib/auth';
import { productSchema } from '@/lib/validations';

export const revalidate = 60;

// Public GET products with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const featuredOnly = searchParams.get('featured') === 'true';

    const whereClause: Prisma.ProductWhereInput = {};

    if (featuredOnly) {
      whereClause.featured = true;
    }

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = {
        slug: categorySlug,
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        shortDescription: true,
        material: true,
        featured: true,
        available: true,
        image: true,
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

    // Map Prisma models to clean API response objects
    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category.slug,
      categoryName: p.category.name,
      categoryId: p.categoryId,
      shortDescription: p.shortDescription || '',
      description: p.shortDescription || '',
      material: p.material || undefined,
      featured: p.featured,
      isFeatured: p.featured,
      available: p.available,
      image: p.image,
      gallery: [],
      specifications: [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(mapped, {
      headers: {
        'Cache-Control': search
          ? 'private, no-cache'
          : 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// Protected POST create product (Admin only)
export async function POST(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const rawSlug = data.slug && data.slug.trim() ? data.slug : data.name;
    let slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug) {
      slug = `product-${Date.now()}`;
    }

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      if (data.slug && data.slug.trim()) {
        return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 400 });
      }
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        shortDescription: data.shortDescription,
        description: data.description,
        material: data.material,
        featured: data.featured,
        available: data.available,
        image: data.image,
        gallery: data.gallery,
        specifications: data.specifications,
      },
      include: { category: true },
    });

    // Revalidate Edge CDN cache & Next.js static pages
    try {
      revalidateTag('products', 'default');
    } catch (e) {
      console.error('revalidateTag error:', e);
    }

    try {
      revalidatePath('/products');
      revalidatePath('/admin/products');
      revalidatePath('/');
      revalidatePath(`/products/${slug}`);
      revalidatePath('/api/products');
    } catch (e) {
      console.error('revalidatePath error:', e);
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
