'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  video1Url: string;
  video2Url: string;
  tiktokLink: string;
  shopeeLink: string;
  isActive: boolean;
}

export default function PageView() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Track click count - localStorage persists across app switches
  // Use slug-specific key so each page has its own counter
  const storageKey = `videoClickCount_${slug}`;
  const [clickCount, setClickCount] = useState(0);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Detect Facebook/Instagram/Zalo/Line in-app browsers (Android only)
    // iOS can use the built-in browser
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const inApp = isAndroid && /FBAN|FBAV|FB_IAB|Instagram|Line\/|Zalo/i.test(ua);
    setIsInAppBrowser(inApp);
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));

    // If Android in-app browser detected, try to auto-open in external browser
    if (inApp) {
      // Android: use intent scheme to open in Chrome/default browser
      const currentUrl = window.location.href;
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
      window.location.href = intentUrl;
    }

    // Restore click count from localStorage (per-page counter)
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setClickCount(parseInt(saved));
    }

    // Fetch page content by slug
    fetchPage();

    return () => window.removeEventListener('resize', checkMobile);
  }, [slug]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/pages?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      
      if (data.page && data.page.isActive) {
        setPage(data.page);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to fetch page:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Open link in new tab (always external browser at this point)
  const openLink = (type: 'tiktok' | 'shopee') => {
    const url = type === 'tiktok' ? page!.tiktokLink : page!.shopeeLink;
    window.open(url, '_blank');
  };

  const handleVideoClick = () => {
    if (!page) return;

    if (isMobile) {
      // Mobile logic: Click 1 -> TikTok, Click 2 -> Shopee, Click 3+ -> Allow play
      if (clickCount === 0) {
        openLink('tiktok');
        setClickCount(1);
        localStorage.setItem(storageKey, '1');
      } else if (clickCount === 1) {
        openLink('shopee');
        setClickCount(2);
        localStorage.setItem(storageKey, '2');
      }
    } else {
      // PC logic: Click 1 -> TikTok, Click 2+ -> Allow play (no Shopee)
      if (clickCount === 0) {
        openLink('tiktok');
        setClickCount(1);
        localStorage.setItem(storageKey, '1');
      }
    }
  };

  const shouldShowOverlay = () => {
    if (isMobile) {
      return clickCount < 2; // Show overlay for clicks 0 and 1
    } else {
      return clickCount < 1; // Show overlay for click 0 only
    }
  };

  const getButtonText = () => {
    return 'Click để xem video';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-6xl mb-4">404</p>
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy trang</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Show in-app browser escape screen (iOS only - Android auto-redirects via intent)
  if (isInAppBrowser) {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }).catch(() => {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
    };

    const handleOpenExternal = () => {
      const ua = navigator.userAgent || '';
      
      if (/Android/i.test(ua)) {
        // Android intent - open in Chrome
        const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
        window.location.href = intentUrl;
      } else {
        // iOS: use server-side redirect page with <a target="_blank"> trick
        // This is the most reliable way to escape FB in-app browser on iOS
        window.location.href = `/api/open?url=${encodeURIComponent(currentUrl)}`;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Mở bằng trình duyệt
          </h1>
          <p className="text-gray-600 mb-6">
            Để xem video, vui lòng mở trang này bằng trình duyệt bên ngoài (Chrome, Safari...)
          </p>

          {/* Auto open button */}
          <button
            onClick={handleOpenExternal}
            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors mb-3 text-lg"
          >
            🌐 Mở trình duyệt
          </button>

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors mb-6"
          >
            {linkCopied ? '✅ Đã copy link!' : '📋 Copy link'}
          </button>

          {/* Manual instructions */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-3 font-medium">Nếu không mở được, làm thủ công:</p>
            {isIOS ? (
              <div className="text-left text-sm text-gray-600 space-y-2">
                <p>1. Nhấn nút <span className="font-bold">⋯</span> hoặc <span className="font-bold">ᐧᐧᐧ</span> (góc dưới phải màn hình)</p>
                <p>2. Chọn <span className="font-bold">&quot;Mở trong Safari&quot;</span> hoặc <span className="font-bold">&quot;Open in Safari&quot;</span></p>
                <p className="text-gray-400 italic">Hoặc copy link ở trên rồi dán vào Safari</p>
              </div>
            ) : (
              <div className="text-left text-sm text-gray-600 space-y-2">
                <p>1. Nhấn nút <span className="font-bold">⋮</span> (góc trên phải)</p>
                <p>2. Chọn <span className="font-bold">&quot;Mở bằng Chrome&quot;</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
            {page.title}
          </h1>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {page.description}
            </p>
          </div>

          {/* Videos Section - Vertical Layout */}
          <div className="flex flex-col gap-6">
            {/* Video 1 */}
            <div className="relative">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  src={page.video1Url}
                  className={shouldShowOverlay() ? 'blur-video w-full h-full object-cover' : 'w-full h-full object-cover'}
                  controls={!shouldShowOverlay()}
                  playsInline
                />
                {shouldShowOverlay() && (
                  <div className="video-overlay" onClick={handleVideoClick}>
                    <div className="text-center px-4">
                      <div className="bg-red-600 text-white px-6 py-3 rounded-lg mb-4 inline-block">
                        <p className="font-bold text-lg">⚠️ VIDEO NHẠY CẢM</p>
                      </div>
                      <button className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                        {getButtonText()}
                      </button>
                      <p className="text-white text-sm mt-4">Cân nhắc trước khi xem</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video 2 */}
            <div className="relative">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  src={page.video2Url}
                  className={shouldShowOverlay() ? 'blur-video w-full h-full object-cover' : 'w-full h-full object-cover'}
                  controls={!shouldShowOverlay()}
                  playsInline
                />
                {shouldShowOverlay() && (
                  <div className="video-overlay" onClick={handleVideoClick}>
                    <div className="text-center px-4">
                      <div className="bg-red-600 text-white px-6 py-3 rounded-lg mb-4 inline-block">
                        <p className="font-bold text-lg">⚠️ VIDEO NHẠY CẢM</p>
                      </div>
                      <button className="bg-white text-gray-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                        {getButtonText()}
                      </button>
                      <p className="text-white text-sm mt-4">Cân nhắc trước khi xem</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
