import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockContent } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');

  if (!type || !['tiktok', 'shopee'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    let content = await prisma.content.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!content) {
      content = mockContent as any;
    }

    const url = type === 'tiktok' ? content!.tiktokLink : content!.shopeeLink;

    // Return an HTML page that redirects - this bypasses Facebook in-app browser restrictions
    // Using both meta refresh and JS redirect for maximum compatibility
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${url}">
  <title>Redirecting...</title>
  <script>window.location.replace("${url}");</script>
</head>
<body>
  <p>Đang chuyển hướng... <a href="${url}">Click here</a></p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Redirect error:', error);
    // Fallback to mock data
    const url = type === 'tiktok' ? mockContent.tiktokLink : mockContent.shopeeLink;
    return NextResponse.redirect(url);
  }
}
