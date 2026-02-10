'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  isActive: boolean;
}

export default function HomePage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.pages) {
        // Only show active pages
        const activePages = data.pages.filter((p: Page) => p.isActive);
        setPages(activePages);
      }
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Chưa có trang nào</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
            Danh sách nội dung
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Chọn trang để xem video
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    {page.title}
                  </h2>
                  <span className="text-sm bg-purple-200 text-purple-800 px-3 py-1 rounded-full">
                    /{page.slug}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-2">
                  {page.description}
                </p>
                <div className="mt-4 text-purple-600 font-medium flex items-center gap-2">
                  Xem ngay
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Admin link */}
          <div className="mt-8 text-center">
            <a
              href="/admin"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
