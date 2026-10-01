import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

// Public GET categories
export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    const requestCacheHeader = request.headers.get('cache-control');
    const isNoCacheRequested = requestCacheHeader?.includes('no-cache') || requestCacheHeader?.includes('no-store');

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': isNoCacheRequested
          ? 'no-cache, no-store, must-revalidate'
          : 'public, max-age=0, s-maxage=5, stale-while-revalidate=30',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Protected POST create category (Admin only)
export async function POST(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;
    const rawSlug = validation.data.slug && validation.data.slug.trim() ? validation.data.slug : name;
    let slug = rawSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!slug) slug = `category-${Date.now()}`;

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: { name: name.trim(), slug, description: description?.trim() || null },
    });

    try {
      revalidateTag('categories', 'default');
      revalidateTag('products', 'default');
    } catch (e) {
      console.error('revalidateTag error:', e);
    }

    try {
      revalidatePath('/admin/categories');
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/api/categories');
    } catch (e) {
      console.error('revalidatePath error:', e);
    }

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
