import { NextRequest, NextResponse } from 'next/server';

// This route is kept as a fallback but the main upload flow
// goes directly from browser to Cloudinary via /api/upload/sign
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Please use direct Cloudinary upload. Videos are uploaded from browser directly to Cloudinary to avoid size limits.' },
    { status: 400 }
  );
}
