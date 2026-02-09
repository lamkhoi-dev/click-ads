// Mock data for testing without database
export const mockContent = {
  id: 'mock-1',
  title: 'Video Demo - Testing Affiliate System',
  description: `Đây là nội dung demo để test hệ thống affiliate.

Hướng dẫn test:
1. Mở trang này trên điện thoại (hoặc resize browser < 768px)
2. Click vào video - sẽ redirect đến TikTok
3. Click lần 2 - sẽ redirect đến Shopee  
4. Click lần 3 - được xem video

Trên PC (> 768px):
1. Click lần 1 - redirect TikTok
2. Click lần 2 - được xem video (không có Shopee)`,
  video1Url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  video2Url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  tiktokLink: 'https://www.tiktok.com/@tiktok',
  shopeeLink: 'https://shopee.vn',
  createdAt: new Date(),
  updatedAt: new Date(),
};
