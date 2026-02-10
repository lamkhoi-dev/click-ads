'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Content form
  const [content, setContent] = useState({
    id: '',
    title: '',
    description: '',
    video1Url: '',
    video2Url: '',
    tiktokLink: '',
    shopeeLink: '',
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
      fetchContent();
    }
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
        fetchContent();
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

  const handleVideoUpload = async (file: File, videoNumber: 1 | 2) => {
    const setUploading = videoNumber === 1 ? setUploadingVideo1 : setUploadingVideo2;
    const setProgress = videoNumber === 1 ? setUploadProgress1 : setUploadProgress2;
    setUploading(true);
    setProgress(0);

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
              setContent(prev => ({ ...prev, video1Url: result.secure_url }));
            } else {
              setContent(prev => ({ ...prev, video2Url: result.secure_url }));
            }
            alert('Video uploaded successfully!');
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

    try {
      const method = content.id ? 'PUT' : 'POST';
      const res = await fetch('/api/content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Content saved successfully!');
        setContent(data.content);
      } else {
        alert(data.error || 'Save failed');
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nội dung / Mô tả
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                rows={4}
                value={content.description}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              {uploadingVideo1 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${uploadProgress1}%` }}></div>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">Uploading... {uploadProgress1}%</p>
                </div>
              )}
              {content.video1Url && (
                <p className="text-sm text-green-600 mt-2">✓ Video uploaded: {content.video1Url.substring(0, 50)}...</p>
              )}
            </div>

            <div className="mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
              {uploadingVideo2 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${uploadProgress2}%` }}></div>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">Uploading... {uploadProgress2}%</p>
                </div>
              )}
              {content.video2Url && (
                <p className="text-sm text-green-600 mt-2">✓ Video uploaded: {content.video2Url.substring(0, 50)}...</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                TikTok Link
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="https://vt.tiktok.com/..."
                value={content.tiktokLink}
                onChange={(e) => setContent({ ...content, tiktokLink: e.target.value })}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Shopee Link
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="https://s.shopee.vn/..."
                value={content.shopeeLink}
                onChange={(e) => setContent({ ...content, shopeeLink: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploadingVideo1 || uploadingVideo2}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Content'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-300">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              View User Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
