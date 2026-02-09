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
  
  // Track click count - resets on every page load
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

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

  const handleVideoClick = () => {
    if (!content) return;

    if (isMobile) {
      // Mobile logic: Click 1 -> TikTok, Click 2 -> Shopee, Click 3+ -> Allow play
      if (clickCount === 0) {
        // First click -> redirect to TikTok
        window.open(content.tiktokLink, '_blank');
        setClickCount(1);
      } else if (clickCount === 1) {
        // Second click -> redirect to Shopee
        window.open(content.shopeeLink, '_blank');
        setClickCount(2);
      } else {
        // Third click and beyond -> Allow video to play (do nothing, remove overlay)
        // The overlay will not show anymore
      }
    } else {
      // PC logic: Click 1 -> TikTok, Click 2+ -> Allow play (no Shopee)
      if (clickCount === 0) {
        // First click -> redirect to TikTok
        window.open(content.tiktokLink, '_blank');
        setClickCount(1);
      } else {
        // Second click and beyond -> Allow video to play
        // The overlay will not show anymore
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
