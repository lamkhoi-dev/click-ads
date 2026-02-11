import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// CRITICAL: Force this route to be dynamic (never cached/static)
// Without this, Next.js will cache the response at build time
// and the timestamp will be stale (causing Cloudinary "Stale request" error)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Validate env vars
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary env vars:', {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET,
      });
      return NextResponse.json(
        { error: 'Cloudinary configuration missing. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to Vercel env vars.' },
        { status: 500 }
      );
    }

    // Generate fresh timestamp (Unix timestamp in seconds)
    const timestamp = Math.floor(Date.now() / 1000);
    
    console.log('Generating signature with timestamp:', timestamp, 'Date:', new Date(timestamp * 1000).toISOString());

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: 'click-ads',
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json(
      {
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Signing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
