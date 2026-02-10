import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extract public_id from Cloudinary URL
// Example: https://res.cloudinary.com/dwnxkx4xw/video/upload/v1234567890/click-ads/video123.mp4
// Returns: click-ads/video123
function extractPublicId(url: string): string | null {
  try {
    // Match pattern: /upload/v{numbers}/{folder}/{filename}.{ext}
    const match = url.match(/\/upload\/v\d+\/(.+)\.(mp4|mov|avi|webm|mkv)$/);
    if (match && match[1]) {
      return match[1]; // Returns folder/filename without extension
    }
    
    // Try alternative pattern without version
    const match2 = url.match(/\/upload\/(.+)\.(mp4|mov|avi|webm|mkv)$/);
    if (match2 && match2[1]) {
      return match2[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Skip deletion if it's not a Cloudinary URL
    if (!videoUrl.includes('cloudinary.com')) {
      return NextResponse.json({ success: true, skipped: true, message: 'Not a Cloudinary URL' });
    }

    // Extract public_id from URL
    const publicId = extractPublicId(videoUrl);
    
    if (!publicId) {
      console.warn('Could not extract public_id from URL:', videoUrl);
      return NextResponse.json(
        { error: 'Invalid Cloudinary URL format' },
        { status: 400 }
      );
    }

    // Delete video from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
      invalidate: true, // Invalidate CDN cache
    });

    console.log('Cloudinary delete result:', result);

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary delete failed: ${result.result}`);
    }

    return NextResponse.json({
      success: true,
      result: result.result,
      publicId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete video error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to delete video', details: errorMessage },
      { status: 500 }
    );
  }
}
