'use client';

import { useState, useEffect } from 'react';

interface Content {
  id: string;
  title: string;
  description: string;
  video1Url: string;
  video2Url: string;
  tiktokLink: string;
  shopeeLink: string;
}

export default function HomePage() {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Track click count - persisted in localStorage
  // Resets only when video was already unlocked (all clicks completed)
  const [clickCount, setClickCount] = useState(0);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Detect Facebook/Instagram/Zalo/Line in-app browsers
    const ua = navigator.userAgent || '';
    setIsInAppBrowser(/FBAN|FBAV|FB_IAB|Instagram|Line\/|Zalo/i.test(ua));

    // Load click count from localStorage
    const saved = localStorage.getItem('videoClickCount');
    const mobile = window.innerWidth <= 768;
    if (saved) {
      const count = parseInt(saved);
      // If video was already unlocked (mobile: >=2, PC: >=1), reset to 0
      if ((mobile && count >= 2) || (!mobile && count >= 1)) {
        localStorage.setItem('videoClickCount', '0');
        setClickCount(0);
      } else {
        setClickCount(count);
      }
    }

    // Fetch content
    fetchContent();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
      }
    } catch (err) {
      console.error('Failed to fetch content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open link - bypasses Facebook/Instagram in-app browser restrictions
  const openLink = (type: 'tiktok' | 'shopee') => {
    if (isInAppBrowser) {
      // In-app browser: navigate to same-domain redirect page
      // This bypasses the "trying to open another app" warning
      window.location.href = `/api/go?type=${type}`;
    } else {
      // Normal browser: open in new tab
      const url = type === 'tiktok' ? content!.tiktokLink : content!.shopeeLink;
      window.open(url, '_blank');
    }
  };

  const handleVideoClick = () => {
    if (!content) return;

    if (isMobile) {
      // Mobile logic: Click 1 -> TikTok, Click 2 -> Shopee, Click 3+ -> Allow play
      if (clickCount === 0) {
        openLink('tiktok');
        setClickCount(1);
        localStorage.setItem('videoClickCount', '1');
      } else if (clickCount === 1) {
        openLink('shopee');
        setClickCount(2);
        localStorage.setItem('videoClickCount', '2');
      }
    } else {
      // PC logic: Click 1 -> TikTok, Click 2+ -> Allow play (no Shopee)
      if (clickCount === 0) {
        openLink('tiktok');
        setClickCount(1);
        localStorage.setItem('videoClickCount', '1');
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

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Chưa có nội dung</p>
          <a href="/admin" className="text-blue-600 hover:underline">
            Đi tới trang Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
            {content.title}
          </h1>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {content.description}
            </p>
          </div>

          {/* Videos Section - Vertical Layout */}
          <div className="flex flex-col gap-6">
            {/* Video 1 */}
            <div className="relative">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  src={content.video1Url}
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
                  src={content.video2Url}
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
