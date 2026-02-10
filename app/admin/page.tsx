'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pages list
  const [pages, setPages] = useState<Page[]>([]);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Page form
  const [pageForm, setPageForm] = useState({
    id: '',
    slug: '',
    title: '',
    description: '',
    video1Url: '',
    video2Url: '',
    tiktokLink: '',
    shopeeLink: '',
    isActive: true,
  });

  const [uploadingVideo1, setUploadingVideo1] = useState(false);
  const [uploadingVideo2, setUploadingVideo2] = useState(false);
  const [uploadProgress1, setUploadProgress1] = useState(0);
  const [uploadProgress2, setUploadProgress2] = useState(0);

  useEffect(() => {
    // Check if already logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      fetchPages();
    }
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminLoggedIn', 'true');
        setIsLoggedIn(true);
        fetchPages();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    setLoginForm({ username: '', password: '' });
  };

  const handleCreateNew = () => {
    setPageForm({
      id: '',
      slug: '',
      title: '',
      description: '',
      video1Url: '',
      video2Url: '',
      tiktokLink: '',
      shopeeLink: '',
      isActive: true,
    });
    setEditingPage(null);
    setShowCreateForm(true);
  };

  const handleEdit = (page: Page) => {
    setPageForm(page);
    setEditingPage(page);
    setShowCreateForm(true);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingPage(null);
    setPageForm({
      id: '',
      slug: '',
      title: '',
      description: '',
      video1Url: '',
      video2Url: '',
      tiktokLink: '',
      shopeeLink: '',
      isActive: true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa trang này?')) return;

    // Find the page to get video URLs for deletion
    const pageToDelete = pages.find(p => p.id === id);

    try {
      const res = await fetch('/api/pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        // Delete videos from Cloudinary after successful page deletion
        if (pageToDelete) {
          const deletePromises: Promise<any>[] = [];
          
          if (pageToDelete.video1Url && pageToDelete.video1Url.includes('cloudinary.com')) {
            deletePromises.push(
              fetch('/api/upload/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: pageToDelete.video1Url }),
              }).catch(err => console.warn('Failed to delete video1:', err))
            );
          }
          
          if (pageToDelete.video2Url && pageToDelete.video2Url.includes('cloudinary.com')) {
            deletePromises.push(
              fetch('/api/upload/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl: pageToDelete.video2Url }),
              }).catch(err => console.warn('Failed to delete video2:', err))
            );
          }
          
          // Delete videos in parallel (non-blocking)
          Promise.all(deletePromises).then(() => {
            console.log('Videos deleted from Cloudinary');
          });
        }
        
        alert('Đã xóa!');
        fetchPages();
      } else {
        const data = await res.json();
        alert(data.error || 'Xóa thất bại');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleToggleActive = async (page: Page) => {
    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, isActive: !page.isActive }),
      });

      if (res.ok) {
        fetchPages();
      } else {
        const data = await res.json();
        alert(data.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleVideoUpload = async (file: File, videoNumber: 1 | 2) => {
    const setUploading = videoNumber === 1 ? setUploadingVideo1 : setUploadingVideo2;
    const setProgress = videoNumber === 1 ? setUploadProgress1 : setUploadProgress2;
    setUploading(true);
    setProgress(0);

    // Save old video URL to delete after successful upload
    const oldVideoUrl = videoNumber === 1 ? pageForm.video1Url : pageForm.video2Url;

    try {
      // Get signature from our API
      const sigRes = await fetch('/api/upload/sign');
      
      if (!sigRes.ok) {
        const sigData = await sigRes.json();
        const errorMsg = sigData.error || 'Failed to get upload signature';
        console.error('Sign API error:', errorMsg);
        alert('Lỗi cấu hình: ' + errorMsg + '\n\nVui lòng kiểm tra env vars CLOUDINARY_* trên Vercel.');
        return;
      }

      const sigData = await sigRes.json();

      // Upload directly to Cloudinary from browser (bypasses Vercel 4.5MB limit)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('folder', 'click-ads');

      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText);
            if (videoNumber === 1) {
              setPageForm(prev => ({ ...prev, video1Url: result.secure_url }));
            } else {
              setPageForm(prev => ({ ...prev, video2Url: result.secure_url }));
            }
            resolve();
          } else {
            const errorText = xhr.responseText;
            console.error('Cloudinary upload error:', xhr.status, errorText);
            reject(new Error(`Upload failed: ${xhr.status} - ${errorText}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload error')));
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`);
        xhr.send(formData);
      });

      // Delete old video from Cloudinary to save storage
      if (oldVideoUrl && oldVideoUrl.includes('cloudinary.com')) {
        try {
          const deleteRes = await fetch('/api/upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUrl: oldVideoUrl }),
          });

          if (deleteRes.ok) {
            console.log('Old video deleted successfully');
          } else {
            console.warn('Failed to delete old video (non-critical)');
          }
        } catch (delErr) {
          console.warn('Error deleting old video (non-critical):', delErr);
        }
      }

      alert('Video uploaded successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Upload error:', errorMsg);
      alert('Upload error: ' + errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate slug
    if (!pageForm.slug || !/^[a-z0-9-]+$/i.test(pageForm.slug)) {
      alert('Slug chỉ được chứa chữ cái, số, và dấu gạch ngang (-)');
      setLoading(false);
      return;
    }

    try {
      const method = pageForm.id ? 'PUT' : 'POST';
      const res = await fetch('/api/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageForm),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Đã lưu!');
        fetchPages();
        handleCancelForm();
      } else {
        alert(data.error || 'Lưu thất bại');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin - Quản lý Pages</h1>
            <div className="flex gap-2">
              <button
                onClick={handleCreateNew}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                + Tạo trang mới
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingPage ? 'Chỉnh sửa trang' : 'Tạo trang mới'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="1, 2, hot-trend, etc"
                      value={pageForm.slug}
                      onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                      required
                      pattern="[a-zA-Z0-9-]+"
                      title="Chỉ chữ cái, số, và dấu gạch ngang"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /{pageForm.slug}</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      value={pageForm.title}
                      onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    rows={3}
                    value={pageForm.description}
                    onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video 1
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file, 1);
                      }}
                      disabled={uploadingVideo1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                    />
                    {uploadingVideo1 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${uploadProgress1}%` }}></div>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">Uploading... {uploadProgress1}%</p>
                      </div>
                    )}
                    {pageForm.video1Url && (
                      <p className="text-sm text-green-600 mt-2">✓ {pageForm.video1Url.substring(0, 40)}...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Video 2
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file, 2);
                      }}
                      disabled={uploadingVideo2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                    />
                    {uploadingVideo2 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${uploadProgress2}%` }}></div>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">Uploading... {uploadProgress2}%</p>
                      </div>
                    )}
                    {pageForm.video2Url && (
                      <p className="text-sm text-green-600 mt-2">✓ {pageForm.video2Url.substring(0, 40)}...</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      TikTok Link *
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="https://vt.tiktok.com/..."
                      value={pageForm.tiktokLink}
                      onChange={(e) => setPageForm({ ...pageForm, tiktokLink: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Shopee Link *
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                      placeholder="https://s.shopee.vn/..."
                      value={pageForm.shopeeLink}
                      onChange={(e) => setPageForm({ ...pageForm, shopeeLink: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pageForm.isActive}
                      onChange={(e) => setPageForm({ ...pageForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 font-bold">Hiển thị trang (isActive)</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || uploadingVideo1 || uploadingVideo2}
                    className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Đang lưu...' : editingPage ? 'Cập nhật' : 'Tạo trang'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-6 bg-gray-300 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pages List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách Pages</h2>
            {pages.length === 0 ? (
              <p className="text-gray-600">Chưa có trang nào. Tạo trang đầu tiên!</p>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`border rounded-lg p-4 ${page.isActive ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-300 opacity-60'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{page.title}</h3>
                          <span className="text-sm bg-purple-200 text-purple-800 px-3 py-1 rounded-full">
                            /{page.slug}
                          </span>
                          {page.isActive ? (
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                          ) : (
                            <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">HIDDEN</span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">{page.description}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>ID: {page.id.substring(0, 8)}</span>
                          <span>•</span>
                          <span>Videos: {page.video1Url ? '✓' : '✗'} {page.video2Url ? '✓' : '✗'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 text-sm"
                        >
                          Xem
                        </a>
                        <button
                          onClick={() => handleToggleActive(page)}
                          className={`px-3 py-2 rounded-md text-sm ${page.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        >
                          {page.isActive ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button
                          onClick={() => handleEdit(page)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-300">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              ← Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
