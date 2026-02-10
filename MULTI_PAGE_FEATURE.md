# 🎯 Multi-Page Feature - Hướng dẫn sử dụng

## Tổng quan

Website đã được nâng cấp từ **1 trang duy nhất** → **Nhiều trang độc lập**, mỗi trang có:
- URL riêng (slug): `/1`, `/2`, `/hot-trend`, etc
- 2 videos riêng
- 2 affiliate links riêng (TikTok + Shopee)
- Quản lý riêng biệt trong admin

---

## Cách sử dụng

### 1. Homepage (Trang chủ)
**URL**: `https://your-domain.vercel.app/`

**Hiển thị**: Danh sách tất cả các trang đang active
- Hiển thị title, description, và slug của mỗi trang
- Click vào card để xem trang chi tiết

### 2. Trang chi tiết
**URL**: `https://your-domain.vercel.app/[slug]`

Ví dụ:
- `https://your-domain.vercel.app/1` - Trang có slug "1"
- `https://your-domain.vercel.app/2` - Trang có slug "2"
- `https://your-domain.vercel.app/hot-trend` - Trang có slug "hot-trend"

**Tính năng**:
- Hiển thị 2 videos với overlay click-to-view
- Click tracking PER-PAGE (mỗi trang có counter riêng)
- Redirect TikTok/Shopee link theo logic cũ
- Xử lý Facebook in-app browser
- 404 nếu slug không tồn tại hoặc trang bị ẩn (isActive=false)

### 3. Admin Dashboard
**URL**: `https://your-domain.vercel.app/admin`

**Login**: Username + password như cũ (env vars)

**Chức năng**:

#### A. Xem danh sách pages
- Hiển thị tất cả pages (kể cả hidden)
- Mỗi page có badge ACTIVE/HIDDEN
- Link "Xem" mở trang trong tab mới

#### B. Tạo page mới
1. Click nút **"+ Tạo trang mới"**
2. Nhập thông tin:
   - **Slug** (bắt buộc): Chỉ chữ cái, số, dấu gạch ngang. VD: `1`, `2`, `hot-trend`, `video-18`
   - **Tiêu đề**: Tên hiển thị của trang
   - **Mô tả**: Nội dung mô tả
   - **Video 1 & 2**: Upload từ máy (gửi lên Cloudinary)
   - **TikTok Link**: Affiliate link TikTok
   - **Shopee Link**: Affiliate link Shopee
   - **isActive**: Checkbox hiển thị/ẩn trang
3. Click **"Tạo trang"**

#### C. Sửa page
1. Click nút **"Sửa"** trên page muốn chỉnh
2. Form hiện ra với data đã điền sẵn
3. Có thể đổi **slug** (chuyển `/1` → `/video-1`)
4. Upload lại videos nếu cần
5. Click **"Cập nhật"**

#### D. Ẩn/Hiện page
- Click nút **"Ẩn"** để isActive=false → Trang không xuất hiện trên homepage và trả về 404
- Click nút **"Hiện"** để isActive=true → Trang hoạt động bình thường

#### E. Xóa page
- Click nút **"Xóa"**
- Confirm xóa vĩnh viễn

---

## Database Schema

### Model: `Page`
```prisma
model Page {
  id          String   @id @default(cuid())
  slug        String   @unique       // URL path
  title       String
  description String   @db.Text
  video1Url   String
  video2Url   String
  tiktokLink  String
  shopeeLink  String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API Endpoints

### GET `/api/pages`
**Query params**:
- `?slug=1` - Lấy 1 page theo slug
- Không có param - Lấy tất cả pages

**Response**:
```json
{
  "pages": [
    {
      "id": "clxxx",
      "slug": "1",
      "title": "Video hot #1",
      "description": "...",
      "video1Url": "https://res.cloudinary.com/...",
      "video2Url": "https://res.cloudinary.com/...",
      "tiktokLink": "https://vt.tiktok.com/...",
      "shopeeLink": "https://s.shopee.vn/...",
      "isActive": true
    }
  ]
}
```

### POST `/api/pages`
**Body**: Page object (without `id`)
**Action**: Tạo page mới
**Validation**: Slug unique, required fields

### PUT `/api/pages`
**Body**: Page object (with `id`)
**Action**: Cập nhật page
**Validation**: Slug unique (nếu đổi slug)

### DELETE `/api/pages`
**Body**: `{ "id": "clxxx" }`
**Action**: Xóa page vĩnh viễn

---

## Migration

### Bước 1: Push database schema (QUAN TRỌNG)

```bash
npx prisma db push
```

**LƯU Ý**: Lệnh này sẽ **XÓA table Content cũ** và tạo **table Page mới**. Data cũ sẽ mất.

### Bước 2: Seed database

```bash
npm run seed
```

Tạo:
- 1 admin user (từ env vars)
- 2 sample pages (slug: "1" và "2")

### Bước 3: Deploy lên Vercel

```bash
git add .
git commit -m "feat: multi-page support"
git push
```

Vercel tự động deploy.

**Kiểm tra env vars trên Vercel**:
- ✅ DATABASE_URL
- ✅ PRISMA_DATABASE_URL
- ✅ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- ✅ ADMIN_USERNAME, ADMIN_PASSWORD
- ✅ NEXTAUTH_SECRET

---

## Ví dụ Use Case

### Case 1: Tạo nhiều landing pages cho các campaign khác nhau
- `/promo-1` - Campaign khuyến mãi 1
- `/promo-2` - Campaign khuyến mãi 2
- `/viral-trend` - Video viral trending

### Case 2: A/B testing
- `/control` - Version gốc
- `/variant-a` - Thử nghiệm A
- `/variant-b` - Thử nghiệm B

### Case 3: Phân loại theo nội dung
- `/18plus` - Nội dung 18+
- `/comedy` - Video hài
- `/sports` - Video thể thao

---

## Click Tracking

Mỗi trang có **localStorage counter riêng**:
- Key: `videoClickCount_[slug]`
- VD: `videoClickCount_1`, `videoClickCount_2`

**Mobile logic** (mỗi trang):
1. Click 1 → Mở TikTok link
2. Click 2 → Mở Shopee link
3. Click 3+ → Cho xem video

**PC logic** (mỗi trang):
1. Click 1 → Mở TikTok link
2. Click 2+ → Cho xem video (không có Shopee)

---

## Troubleshooting

### Lỗi: "Slug already exists"
→ Slug đã được dùng, chọn slug khác

### Lỗi: "Page not found" khi truy cập /1
→ Kiểm tra:
1. Database đã push schema chưa? (`npx prisma db push`)
2. Đã seed data chưa? (`npm run seed`)
3. Page có isActive=true không?

### Lỗi upload video
→ Kiểm tra Cloudinary env vars trên Vercel

### Homepage trống
→ Chưa có page nào isActive=true, vào admin tạo page mới hoặc bật active

---

## File Structure

```
app/
├── [slug]/
│   └── page.tsx              # Dynamic route - Trang chi tiết theo slug
├── admin/
│   └── page.tsx              # Admin dashboard - Quản lý pages
├── api/
│   └── pages/
│       └── route.ts          # CRUD API cho pages
├── page.tsx                  # Homepage - Danh sách pages
prisma/
├── schema.prisma             # Database schema (Page model)
└── seed.ts                   # Seed script
lib/
└── mockData.ts               # Mock data fallback
```

---

## Next Steps (Tùy chọn)

1. **Analytics**: Thêm tracking xem page nào được click nhiều nhất
2. **SEO**: Thêm metadata per-page (title, description, og:image)
3. **Scheduling**: Thêm field `publishAt`, `expireAt` để tự động hiện/ẩn
4. **Categories**: Thêm field `category` để phân loại pages
5. **Stats**: Đếm lượt view, click per page
6. **Bulk actions**: Chọn nhiều pages để xóa/ẩn cùng lúc
7. **Search**: Tìm kiếm pages trong admin
8. **Pagination**: Phân trang danh sách nếu có > 20 pages

---

## Liên hệ

Nếu có vấn đề, kiểm tra:
1. Vercel deployment logs
2. Browser console (F12)
3. Database connection (Prisma Studio: `npx prisma studio`)
