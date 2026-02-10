# 🔄 Database Migration Guide - Multi-Page Support

## Thay đổi

Hệ thống đã được nâng cấp từ **1 trang duy nhất** → **Nhiều trang với slug riêng**

### Schema mới:
- Model `Content` → đổi thành `Page`
- Thêm field `slug` (unique) - URL path như "1", "2", "hot-trend"
- Thêm field `isActive` - show/hide trang

---

## Các bước migrate database

### Bước 1: Push schema mới lên database

```bash
npx prisma db push
```

⚠️ **LƯU Ý**: Lệnh này sẽ **XÓA** table `Content` cũ và tạo table `Page` mới. Data cũ sẽ MẤT.

Nếu muốn giữ data cũ, làm thủ công:

```sql
-- Rename table
ALTER TABLE "Content" RENAME TO "Page";

-- Add new columns
ALTER TABLE "Page" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '1';
ALTER TABLE "Page" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;

-- Make slug unique
ALTER TABLE "Page" ADD CONSTRAINT "Page_slug_key" UNIQUE ("slug");

-- Drop default
ALTER TABLE "Page" ALTER COLUMN "slug" DROP DEFAULT;
```

### Bước 2: Seed lại database

```bash
npm run seed
```

Hoặc trên Vercel (nếu có set env vars):

```bash
$env:DATABASE_URL="YOUR_DATABASE_URL"
$env:PRISMA_DATABASE_URL="YOUR_PRISMA_DATABASE_URL"
npx prisma db seed
```

---

## Trên Vercel

### Option A: Deploy rồi push schema từ terminal

1. Push code lên GitHub
2. Vercel tự deploy
3. Trong terminal local:

```bash
# Set env vars
$env:DATABASE_URL="postgres://..."
$env:PRISMA_DATABASE_URL="prisma+postgres://..."

# Push schema
npx prisma db push

# Seed data
npx prisma db seed
```

### Option B: Manual SQL trên Vercel Dashboard

1. Vào **Vercel → Storage → Postgres → Query**
2. Chạy SQL commands ở trên để migrate
3. Sau đó deploy code

---

## Kiểm tra

1. Vào admin → sẽ thấy danh sách pages
2. Tạo page mới với slug "1", "2", etc
3. Truy cập `https://your-domain.vercel.app/1`
4. Truy cập `https://your-domain.vercel.app/2`

---

## Rollback (nếu có vấn đề)

Nếu muốn quay lại version cũ (1 trang duy nhất):

```bash
git revert HEAD
git push
```

Sau đó restore database từ backup hoặc chạy seed lại với data cũ.
