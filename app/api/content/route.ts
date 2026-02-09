import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockContent } from '@/lib/mockData';

export async function GET() {
  try {
    const content = await prisma.content.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // Return mock data if no content in database (for testing)
    if (!content) {
      return NextResponse.json({ content: mockContent });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    // Return mock data on database error (for testing without DB)
    return NextResponse.json({ content: mockContent });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, video1Url, video2Url, tiktokLink, shopeeLink } = body;

    if (!title || !description || !video1Url || !video2Url || !tiktokLink || !shopeeLink) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Delete existing content and create new one (single content approach)
    await prisma.content.deleteMany({});
    
    const content = await prisma.content.create({
      data: {
        title,
        description,
        video1Url,
        video2Url,
        tiktokLink,
        shopeeLink,
      },
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, video1Url, video2Url, tiktokLink, shopeeLink } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const content = await prisma.content.update({
      where: { id },
      data: {
        title,
        description,
        video1Url,
        video2Url,
        tiktokLink,
        shopeeLink,
      },
    });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}
