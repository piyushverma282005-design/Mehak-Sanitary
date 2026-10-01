import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Protected PUT update category
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();

  try {
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id },
          { slug: rawId },
          { slug: id },
        ],
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found in database' }, { status: 404 });
    }

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
    if (!slug) slug = `category-${existingCategory.id.slice(0, 8)}`;

    const slugCollision = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id: existingCategory.id },
      },
    });

    if (slugCollision) {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists. Please choose a different slug.` },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: existingCategory.id },
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

    return NextResponse.json(updatedCategory);
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    const message = error instanceof Error ? error.message : 'Failed to update category';
    return NextResponse.json(
      { error: message, details: message },
      { status: 500 }
    );
  }
}

// Protected DELETE category
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();

  try {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: rawId },
          { id },
          { slug: rawId },
          { slug: id },
        ],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found in database' }, { status: 404 });
    }

    const productCount = category._count.products;
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${category.name}" because it contains ${productCount} product(s). Please reassign or delete these products first.`,
          productCount,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: category.id },
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

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return NextResponse.json(
      { error: message, details: message },
      { status: 500 }
    );
  }
}
