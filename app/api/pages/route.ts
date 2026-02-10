import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockPages } from '@/lib/mockData';

// GET /api/pages or /api/pages?slug=1
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (slug) {
      // Get single page by slug
      const page = await prisma.page.findUnique({
        where: { slug },
      });

      if (!page) {
        // Fallback to mock data
        const mockPage = mockPages.find(p => p.slug === slug);
        return NextResponse.json({ page: mockPage || null });
      }

      return NextResponse.json({ page });
    } else {
      // Get all pages
      const pages = await prisma.page.findMany({
        orderBy: { createdAt: 'asc' },
      });

      if (pages.length === 0) {
        // Fallback to mock data
        return NextResponse.json({ pages: mockPages });
      }

      return NextResponse.json({ pages });
    }
  } catch (error) {
    console.error('Get pages error:', error);
    // Return mock data on database error
    const slug = request.nextUrl.searchParams.get('slug');
    if (slug) {
      const mockPage = mockPages.find(p => p.slug === slug);
      return NextResponse.json({ page: mockPage || null });
    }
    return NextResponse.json({ pages: mockPages });
  }
}

// POST /api/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, description, video1Url, video2Url, tiktokLink, shopeeLink, isActive } = body;

    if (!slug || !title || !description || !video1Url || !video2Url || !tiktokLink || !shopeeLink) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.page.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists. Please use a different slug.' },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        description,
        video1Url,
        video2Url,
        tiktokLink,
        shopeeLink,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages - Update page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, slug, title, description, video1Url, video2Url, tiktokLink, shopeeLink, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    // If slug is being changed, check it doesn't conflict
    if (slug) {
      const existing = await prisma.page.findUnique({
        where: { slug },
      });

      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: 'Slug already exists. Please use a different slug.' },
          { status: 400 }
        );
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(description && { description }),
        ...(video1Url && { video1Url }),
        ...(video2Url && { video2Url }),
        ...(tiktokLink && { tiktokLink }),
        ...(shopeeLink && { shopeeLink }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
