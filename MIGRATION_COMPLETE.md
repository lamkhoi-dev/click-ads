# ✅ Multi-Page Migration Complete!

Hệ thống đã được nâng cấp thành công từ **single-page** → **multi-page** với slug động.

---

## 🎉 Các thay đổi đã hoàn thành

### 1. Database Schema ✅
- ✅ Model `Content` → `Page`
- ✅ Thêm field `slug` (unique)
- ✅ Thêm field `isActive`
- ✅ Updated seed script cho 2 sample pages

### 2. API Routes ✅
- ✅ `/api/pages` - Full CRUD (GET/POST/PUT/DELETE)
- ✅ Support query `?slug=xxx` để lấy 1 page
- ✅ Validation slug (unique, pattern check)

### 3. Frontend Pages ✅
- ✅ Homepage (`app/page.tsx`) - Danh sách pages
- ✅ Dynamic route (`app/[slug]/page.tsx`) - Hiển thị page theo slug
- ✅ Admin dashboard (`app/admin/page.tsx`) - Quản lý pages

### 4. Features ✅
- ✅ Create, Read, Update, Delete pages
- ✅ Toggle active/inactive
- ✅ Edit slug (admin có thể đổi URL)
- ✅ Video upload to Cloudinary per page
- ✅ Per-page click tracking (localStorage separate per slug)
- ✅ 404 handling cho slug không tồn tại
- ✅ Facebook in-app browser handling (giữ nguyên logic cũ)

---

## 📋 BẮT BUỘC: Chạy migration

### Trên local:

```bash
# 1. Push schema lên database (XÓA table Content cũ, TẠO table Page mới)
npx prisma db push

# 2. Seed sample data (admin user + 2 pages với slug "1" và "2")
npm run seed

# 3. (Optional) Xem database
npx prisma studio
```

### Trên Vercel (sau khi deploy):

**Option A - Từ terminal local:**
```powershell
# Set env vars
$env:DATABASE_URL="YOUR_POSTGRES_URL"
$env:PRISMA_DATABASE_URL="YOUR_PRISMA_ACCELERATE_URL"

# Push schema
npx prisma db push

# Seed data
npm run seed
```

**Option B - Manual SQL trên Vercel Dashboard:**
Xem chi tiết trong [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🧹 Files có thể xóa (optional)

Các file sau **KHÔNG CẦN THIẾT** nữa, có thể xóa để dọn dẹp code:

1. ❌ `app/api/content/route.ts` - Đã được thay thế bằng `/api/pages`
   ```bash
   rm app/api/content/route.ts
   ```

Hoặc giữ lại để backward compatibility (tự điều chỉnh).

---

## 🚀 Deploy lên Vercel

```bash
# 1. Commit changes
git add .
git commit -m "feat: multi-page support with dynamic slug routing"
git push

# 2. Vercel auto-deploy

# 3. Sau khi deploy, chạy migration (xem phần trên)
```

---

## 🧪 Testing Checklist

Sau khi push schema và seed:

### ✅ Homepage
- [ ] Truy cập `/` → Thấy danh sách 2 pages (slug "1" và "2")
- [ ] Click vào card → Redirect đến `/1` hoặc `/2`

### ✅ Dynamic Pages
- [ ] Truy cập `/1` → Thấy page với videos
- [ ] Truy cập `/2` → Thấy page khác với videos khác
- [ ] Truy cập `/nonexistent` → 404 page
- [ ] Click video → TikTok link mở (click 1), Shopee link mở (click 2 mobile)
- [ ] Click counter reset khi chuyển trang (VD: từ `/1` sang `/2`)

### ✅ Admin Dashboard
- [ ] Login `/admin` thành công
- [ ] Thấy danh sách 2 pages
- [ ] Click "Tạo trang mới"
  - [ ] Nhập slug "3", title, description, links
  - [ ] Upload 2 videos
  - [ ] Submit → Page mới xuất hiện trong list
- [ ] Click "Sửa" trên page
  - [ ] Đổi slug từ "3" → "test-page"
  - [ ] Update title
  - [ ] Submit → URL đổi từ `/3` → `/test-page`
- [ ] Click "Ẩn" → Page biến mất khỏi homepage
- [ ] Click "Hiện" → Page xuất hiện lại
- [ ] Click "Xóa" → Confirm → Page bị xóa vĩnh viễn
- [ ] Click "Xem" → Mở page trong tab mới

### ✅ Edge Cases
- [ ] Tạo page với slug trùng → Error "Slug already exists"
- [ ] Tạo page với slug có ký tự đặc biệt (@, #, space) → Validation error
- [ ] Ẩn tất cả pages → Homepage hiển thị "Chưa có trang nào"
- [ ] Upload video > 50MB → Cloudinary xử lý OK (bypasses Vercel limit)

---

## 📊 Database Sample Data

Sau khi seed, database sẽ có:

```
Admin User:
- username: (từ env ADMIN_USERNAME)
- password: (từ env ADMIN_PASSWORD)

Pages:
1. Page {
   slug: "1",
   title: "Hot Content #1",
   description: "Nội dung hot nhất...",
   video1Url: "https://res.cloudinary.com/.../sample1.mp4",
   video2Url: "https://res.cloudinary.com/.../sample2.mp4",
   tiktokLink: "https://vt.tiktok.com/sample",
   shopeeLink: "https://s.shopee.vn/sample",
   isActive: true
}

2. Page {
   slug: "2",
   title: "Viral Video #2",
   description: "Video đang viral...",
   ... (tương tự)
   isActive: true
}
```

---

## 📚 Documentation

Chi tiết hơn xem:
- [MULTI_PAGE_FEATURE.md](./MULTI_PAGE_FEATURE.md) - Hướng dẫn sử dụng đầy đủ
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Hướng dẫn migrate database

---

## 🐛 Nếu có lỗi

### Lỗi: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Lỗi: "Error: P2021: Table does not exist"
```bash
npx prisma db push
```

### Lỗi: 404 khi truy cập /1
1. Check database: `npx prisma studio` → Xem table Page có data không
2. Check isActive: Page phải có isActive = true
3. Check Vercel env vars: DATABASE_URL, PRISMA_DATABASE_URL

### Lỗi upload video
Check Vercel env vars:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY  
- CLOUDINARY_API_SECRET

---

## 🎯 Next Features (Suggestions)

Nếu muốn mở rộng thêm:

1. **SEO per page**: Thêm meta title, description, og:image
2. **Analytics**: Track views, clicks per page  
3. **Categories/Tags**: Phân loại pages
4. **Scheduling**: Auto publish/unpublish theo thời gian
5. **Preview mode**: Xem page trước khi publish
6. **Clone page**: Duplicate page để tạo variant
7. **Bulk import**: Upload CSV để tạo nhiều pages
8. **Custom CSS per page**: Mỗi page có style riêng

---

**Ready to go! 🚀**

Chỉ cần chạy `npx prisma db push` và `npm run seed`, rồi test thôi!
