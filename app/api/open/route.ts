import { NextRequest, NextResponse } from 'next/server';

// This route forces iOS Facebook in-app browser to open in Safari
// by returning a page that programmatically clicks an <a> tag
export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('url') || request.nextUrl.origin;
  
  // Sanitize - only allow same-origin or https URLs
  const safeUrl = target.startsWith('https://') || target.startsWith('/') 
    ? target 
    : request.nextUrl.origin;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Đang mở...</title>
  <style>
    body { 
      margin: 0; padding: 40px 20px; 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: #1a1a2e; color: white;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; box-sizing: border-box;
      text-align: center;
    }
    .container { max-width: 400px; }
    .spinner { 
      width: 40px; height: 40px; margin: 0 auto 20px;
      border: 4px solid rgba(255,255,255,0.2); 
      border-top-color: #fff;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    a.btn {
      display: inline-block; margin-top: 20px;
      padding: 16px 32px; background: #3b82f6; color: white;
      text-decoration: none; border-radius: 12px; font-weight: bold;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Đang mở trình duyệt...</p>
    <a id="openLink" class="btn" href="${safeUrl}" target="_blank" rel="noreferrer noopener">
      Nhấn nếu chưa mở
    </a>
  </div>
  <script>
    // Method 1: Auto-click the link after short delay
    setTimeout(function() {
      var link = document.getElementById('openLink');
      if (link) {
        link.click();
      }
    }, 300);
    
    // Method 2: Try window.location as fallback
    setTimeout(function() {
      window.location.href = "${safeUrl}";
    }, 1500);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
