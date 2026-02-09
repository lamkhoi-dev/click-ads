# 🎯 Hướng Dẫn Sử Dụng - Click Ads Affiliate

## 📖 Mục Lục

1. [Test Ngay Không Cần Cài Gì](#test-ngay)
2. [Cài Đặt Đầy Đủ](#cài-đặt-đầy-đủ)
3. [Sử Dụng Admin Panel](#sử-dụng-admin)
4. [Deploy Lên Vercel](#deploy-vercel)
5. [Cách Hoạt Động](#cách-hoạt-động)

---

## 🚀 Test Ngay {#test-ngay}

Muốn test ngay không cần setup gì phức tạp:

```bash
npm install
npx prisma generate
npm run dev
```

Mở http://localhost:3000 → Website chạy với data mẫu!

**Giải thích:**
- Không cần database
- Tự động dùng 2 video demo từ Google
- Test được toàn bộ logic click
- Admin panel không hoạt động (cần database)

---

## 💻 Cài Đặt Đầy Đủ {#cài-đặt-đầy-đủ}

### Cách 1: Dùng Script Tự Động (Windows)

```bash
setup.bat
```

Script sẽ tự động:
- Cài dependencies
- Setup database
- Tạo admin user
- Chạy website

### Cách 2: Thủ Công

**Bước 1: Install Node Modules**
```bash
npm install
```

**Bước 2: Chọn Database**

**Option A: SQLite (Đơn giản nhất - khuyến khích cho local)**

Sửa `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**Option B: PostgreSQL (Nếu đã cài)**

Tạo database:
```bash
createdb clickads
```

File `.env.local` đã config sẵn cho PostgreSQL.

**Bước 3: Chạy Migration**
```bash
npx prisma migrate dev --name init
```

**Bước 4: Tạo Admin User**
```bash
npx prisma db seed
```

Credentials mặc định:
- Username: `admin`
- Password: `admin123`

**Bước 5: Start Dev Server**
```bash
npm run dev
```

✅ Website chạy tại http://localhost:3000

---

## 🎨 Sử Dụng Admin Panel {#sử-dụng-admin}

### Đăng Nhập

1. Mở http://localhost:3000/admin
2. Nhập:
   - Username: `admin`
   - Password: `admin123`
3. Click **Login**

### Upload Videos

**Cách 1: Upload File (Vercel Blob)**
1. Click **Choose File** ở Video 1
2. Chọn file video từ máy
3. Đợi upload xong (hiện ✓)
4. Làm tương tự cho Video 2

**Cách 2: Dùng URL (Nhanh hơn cho testing)**
1. Tìm video trên mạng (ví dụ Google sample videos)
2. Copy URL
3. Paste trực tiếp vào ô input (sau khi sửa code để accept URL)

### Nhập Nội Dung

**Tiêu đề:**
```
Video Hot - Cực Hấp Dẫn 🔥
```

**Mô tả:**
```
Đây là video cực hot mà bạn không thể bỏ lỡ!

Click vào để xem ngay nhé 😍
```

**TikTok Link:**
```
https://vt.tiktok.com/ZSHoWRd7h/
```

Hoặc TikTok Shop:
```
https://www.tiktok.com/caravel/campaign?...
```

**Shopee Link:**
```
https://s.shopee.vn/9fFIixV2mW
```

### Lưu Content

1. Click **Save Content**
2. Thấy alert "Content saved successfully!"
3. Click **View User Page** để xem

---

## ☁️ Deploy Lên Vercel {#deploy-vercel}

### Bước 1: Push Code Lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/click-ads.git
git push -u origin main
```

### Bước 2: Import Vào Vercel

1. Đăng nhập https://vercel.com
2. Click **Add New** → **Project**
3. Chọn repository **click-ads**
4. Click **Import**

### Bước 3: Setup Database

**Vercel Postgres:**
1. Tab **Storage** → **Create Database**
2. Chọn **Postgres**
3. Name: `clickads-db`
4. Region: **Singapore** (gần VN nhất)
5. Click **Create**

**Vercel Blob:**
1. Tab **Storage** → **Create Store**
2. Chọn **Blob**
3. Name: `clickads-videos`
4. Click **Create**

### Bước 4: Environment Variables

Tab **Settings** → **Environment Variables**, thêm:

```
ADMIN_USERNAME = admin
ADMIN_PASSWORD = MatKhauManhCuaBan123!
NEXTAUTH_SECRET = [generate bằng lệnh dưới]
```

**Generate Secret:**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32
```

### Bước 5: Deploy

Click **Deploy** → Đợi 2-3 phút

### Bước 6: Setup Database

**Dùng Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

**Hoặc SQL Manual:**

Vào **Storage** → **Postgres** → **Query**, chạy:

```sql
-- Tạo tables (copy từ DEPLOY_GUIDE.md)

-- Hash password
-- node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"

INSERT INTO "Admin" ("id", "username", "password", "createdAt")
VALUES ('admin-1', 'admin', 'HASHED_PASSWORD', NOW());
```

### Bước 7: Test

1. Mở `https://your-app.vercel.app`
2. Test user page
3. Login admin: `https://your-app.vercel.app/admin`
4. Upload videos và test

✅ **Xong!**

---

## ⚙️ Cách Hoạt Động {#cách-hoạt-động}

### Flow Trên Mobile

```
User click video lần 1
  ↓
Mở TikTok link trong tab mới
  ↓
Counter = 1, overlay vẫn hiện
  
User click video lần 2
  ↓
Mở Shopee link trong tab mới
  ↓
Counter = 2, overlay vẫn hiện
  
User click video lần 3
  ↓
Overlay biến mất
  ↓
Video play bình thường
```

### Flow Trên PC

```
User click video lần 1
  ↓
Mở TikTok link trong tab mới
  ↓
Counter = 1, overlay vẫn hiện
  
User click video lần 2
  ↓
Overlay biến mất
  ↓
Video play bình thường
(Không có Shopee trên PC)
```

### Tracking Logic

- **Lưu ở đâu:** localStorage của browser
- **Key:** `videoClickCount`
- **Value:** 0, 1, 2, ...
- **Reset:** User xóa localStorage hoặc click nút "Reset"

### Detection Mobile/PC

```typescript
const isMobile = window.innerWidth <= 768
```

- <= 768px: Mobile
- > 768px: Desktop

### Video Blur Effect

```css
.blur-video {
  filter: blur(20px);
}
```

Overlay che phủ video, click vào overlay → redirect hoặc play.

---

## 🎯 Affiliate Strategy

### Tối Ưu Conversion

1. **TikTok Link:**
   - Dùng TikTok Shop product link
   - Hoặc TikTok campaign link
   - Tracking code tích hợp sẵn

2. **Shopee Link:**
   - Dùng Shopee Affiliate link
   - Rút gọn bằng https://s.shopee.vn/
   - Có commission tracking

### Tips

- **Video hấp dẫn:** Càng clickbait càng tốt (đúng pháp luật nhé!)
- **Mobile first:** Phần lớn traffic từ mobile
- **Test links:** Đảm bảo links hoạt động
- **Update thường xuyên:** Đổi video/links mỗi ngày

### Metrics Quan Trọng

- **Click-through rate (CTR):** Bao nhiêu % click vào video
- **Conversion rate:** Bao nhiêu % mua hàng sau redirect
- **Return rate:** User quay lại xem video thật không

---

## 🔧 Troubleshooting

### Video Không Upload

**Nguyên nhân:**
- File quá lớn (> 100MB)
- Không có `BLOB_READ_WRITE_TOKEN`
- Sai format file

**Giải pháp:**
- Compress video
- Check Vercel Blob đã tạo chưa
- Dùng .mp4 format

### Click Không Redirect

**Nguyên nhân:**
- Link sai format
- Popup bị block
- JavaScript error

**Giải pháp:**
- Test link riêng lẻ
- Check browser console
- Dùng `window.open()` thay vì redirect

### Admin Không Login Được

**Nguyên nhân:**
- Database chưa có admin user
- Password sai
- Database connection lỗi

**Giải pháp:**
- Chạy `npx prisma db seed`
- Check `.env.local`
- Xem Prisma Studio: `npx prisma studio`

### Reset Click Count

Khi testing, reset để test lại:

**Cách 1:** Click nút "Reset Click Count" trên page

**Cách 2:** Browser DevTools
1. F12 → Console
2. `localStorage.removeItem('videoClickCount')`
3. Refresh page

**Cách 3:** Clear browser data

---

## 📊 Analytics (Optional)

### Track Với Google Analytics

1. Cài `@next/third-parties`:
```bash
npm install @next/third-parties
```

2. Thêm vào `layout.tsx`:
```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}
```

### Track Custom Events

```typescript
// Track video click
window.gtag('event', 'video_click', {
  click_number: clickCount,
  device_type: isMobile ? 'mobile' : 'desktop',
  action: nextAction, // 'tiktok', 'shopee', 'play'
})
```

---

## 🎁 Bonus: Tối Ưu Hóa

### Thêm Share Button

```tsx
<button onClick={() => {
  if (navigator.share) {
    navigator.share({
      title: content.title,
      text: 'Check out this video!',
      url: window.location.href,
    })
  }
}}>
  Share
</button>
```

### Thêm Preview Thumbnail

```tsx
<video
  poster="/thumbnail.jpg"
  src={videoUrl}
/>
```

### Lazy Load Videos

Videos đã tự động lazy load với Next.js!

---

## ✅ Checklist Production

Trước khi đưa lên production:

- [ ] Đổi admin password mạnh
- [ ] Generate NEXTAUTH_SECRET unique
- [ ] Test trên thiết bị thật (mobile + desktop)
- [ ] Test all links redirect đúng
- [ ] Videos load được
- [ ] Admin panel hoạt động
- [ ] Không có console errors
- [ ] Responsive trên mọi màn hình
- [ ] SEO metadata đã set

---

## 📞 Cần Hỗ Trợ?

1. Đọc **PROJECT_SUMMARY.md** - Tổng quan
2. Đọc **DEPLOY_GUIDE.md** - Chi tiết deploy
3. Đọc **README.md** - Technical docs
4. Check GitHub Issues

---

**Chúc bạn thành công với affiliate! 🚀💰**
