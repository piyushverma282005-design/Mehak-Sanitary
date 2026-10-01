import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { ProductSpecification } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single product by id or slug
export async function GET(request: Request, { params }: RouteParams) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();
  const normalizedSlug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id },
          { slug: rawId },
          { slug: id },
          { slug: normalizedSlug },
          { slug: { equals: id, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category.slug,
        categoryName: product.category.name,
        categoryId: product.categoryId,
        shortDescription: product.shortDescription || '',
        description: product.description,
        material: product.material || undefined,
        featured: product.featured,
        isFeatured: product.featured,
        available: product.available,
        image: product.image,
        gallery: product.gallery,
        specifications: (product.specifications as unknown as ProductSpecification[]) || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    return NextResponse.json(
      { error: 'Failed to fetch product', details: message },
      { status: 500 }
    );
  }
}

// Protected PUT update product
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();
  const normalizedParamSlug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    // Find the existing product record by ID or slug
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id },
          { slug: rawId },
          { slug: id },
          { slug: normalizedParamSlug },
          { slug: { equals: id, mode: 'insensitive' } },
        ],
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

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
      slug = `product-${existingProduct.id.slice(0, 8)}`;
    }

    // Check if ANOTHER product already has this slug
    const slugCollision = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id: existingProduct.id },
      },
    });

    if (slugCollision) {
      slug = `${slug}-${existingProduct.id.slice(0, 4)}`;
      const stillCollides = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: existingProduct.id },
        },
      });
      if (stillCollides) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        shortDescription: data.shortDescription || '',
        description: data.description,
        material: data.material || null,
        featured: data.featured,
        available: data.available,
        image: data.image !== undefined ? data.image : existingProduct.image,
        gallery: data.gallery && data.gallery.length > 0 ? data.gallery : existingProduct.gallery,
        specifications: data.specifications,
      },
      include: { category: true },
    });

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
      if (existingProduct.slug && existingProduct.slug !== slug) {
        revalidatePath(`/products/${existingProduct.slug}`);
      }
      revalidatePath('/api/products');
    } catch (e) {
      console.error('revalidatePath error:', e);
    }

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const message = error instanceof Error ? error.message : 'Failed to update product';
    const isUniqueConstraint = Boolean(
      (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002') ||
      message.includes('Unique constraint')
    );
    return NextResponse.json(
      {
        error: isUniqueConstraint ? 'A product with this URL slug already exists.' : message,
        details: message,
      },
      { status: 500 }
    );
  }
}

// Protected DELETE product
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();
  const normalizedParamSlug = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id },
          { slug: rawId },
          { slug: id },
          { slug: normalizedParamSlug },
          { slug: { equals: id, mode: 'insensitive' } },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

    const deleted = await prisma.product.delete({
      where: { id: existing.id },
    });

    try {
      revalidateTag('products', 'default');
    } catch (e) {
      console.error('revalidateTag error:', e);
    }

    try {
      revalidatePath('/products');
      revalidatePath('/admin/products');
      revalidatePath('/');
      if (deleted?.slug) {
        revalidatePath(`/products/${deleted.slug}`);
      }
      revalidatePath('/api/products');
    } catch (e) {
      console.error('revalidatePath error:', e);
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json(
      { error: message, details: message },
      { status: 500 }
    );
  }
}
