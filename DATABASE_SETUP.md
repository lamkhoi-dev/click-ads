# 🗄️ Database Setup Guide

Hướng dẫn setup, reset và seed database cho cả Local và Production (Vercel).

---

## 📍 Hiện Trạng

Bạn đã có:
- ✅ Deploy project lên Vercel
- ✅ Database Vercel Postgres đã tạo
- ✅ Database URLs (connection strings)
- ✅ Local database đã setup và seed

**⚠️ Lưu ý:** Database local và production là **2 database riêng biệt**.

---

## 🌐 Setup Database Production (Vercel)

### Option 1: Dùng Vercel CLI (Khuyến nghị)

**Step 1: Install Vercel CLI (nếu chưa có)**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Link Project**
```bash
cd c:\An\click_ads
vercel link
```
Chọn:
- Team: Personal account (hoặc team của bạn)
- Project: `click-ads`
- Link to existing: Yes

**Step 4: Pull Environment Variables**
```bash
vercel env pull .env.production
```

**Step 5: Set Environment Variable**
```bash
$env:DATABASE_URL = (Get-Content .env.production | Select-String "POSTGRES_URL_NON_POOLING" | ForEach-Object { $_ -replace 'POSTGRES_URL_NON_POOLING="', '' -replace '"', '' })
```

**Step 6: Push Schema**
```bash
npx prisma db push
```

**Step 7: Seed Database**
```bash
npx prisma db seed
```

✅ Xong! Database production đã có tables và admin user.

---

### Option 2: Dùng Vercel SQL Editor

**Step 1: Vào Vercel Dashboard**
1. https://vercel.com
2. Chọn project `click-ads`
3. Tab **Storage** → `clickads-db`
4. Tab **Query**

**Step 2: Tạo Tables**

Copy và chạy SQL này:

```sql
-- Create Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Admin_username_key" UNIQUE ("username")
);

-- Create Content table
CREATE TABLE IF NOT EXISTS "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "video1Url" TEXT NOT NULL,
    "video2Url" TEXT NOT NULL,
    "tiktokLink" TEXT NOT NULL,
    "shopeeLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);
```

**Step 3: Hash Password**

Trên máy local, chạy:
```bash
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```

Copy kết quả (bắt đầu bằng `$2a$10$...`)

**Step 4: Insert Admin User**

Quay lại Vercel SQL Query, chạy:
```sql
INSERT INTO "Admin" ("id", "username", "password", "createdAt")
VALUES (
    'admin-' || gen_random_uuid()::text,
    'admin',
    'PASTE_HASHED_PASSWORD_HERE',
    NOW()
);
```

Thay `PASTE_HASHED_PASSWORD_HERE` bằng hash password từ Step 3.

**Step 5: Insert Sample Content (Optional)**

```sql
INSERT INTO "Content" ("id", "title", "description", "video1Url", "video2Url", "tiktokLink", "shopeeLink", "createdAt", "updatedAt")
VALUES (
    'content-' || gen_random_uuid()::text,
    'Sample Video Content',
    'This is sample content. Update from admin panel.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://www.tiktok.com/@tiktok',
    'https://shopee.vn',
    NOW(),
    NOW()
);
```

✅ Xong!

---

## 💻 Setup Database Local

### Step 1: Có Database URL

Đã có trong `.env.local`:
```env
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_PRISMA_URL="prisma+postgres://..."
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Push Schema
```bash
npx prisma db push
```

### Step 4: Seed Database
```bash
npx prisma db seed
```

✅ Done! Admin user created:
- Username: `admin`
- Password: `admin123`

---

## 🔄 Reset Database

### Reset Local Database

**Option 1: Prisma Reset (Xóa tất cả)**
```bash
npx prisma migrate reset
```
⚠️ Sẽ xóa toàn bộ data và tạo lại từ đầu.

**Option 2: Xóa từng bảng**
```bash
npx prisma studio
```
Mở http://localhost:5555 → Xóa records thủ công.

**Option 3: SQL Commands**

Nếu có psql:
```sql
TRUNCATE TABLE "Admin" CASCADE;
TRUNCATE TABLE "Content" CASCADE;
```

### Reset Production Database (Vercel)

**Option 1: Qua SQL Editor**

Vercel Dashboard → Storage → Query:
```sql
-- Xóa tất cả data
TRUNCATE TABLE "Admin" CASCADE;
TRUNCATE TABLE "Content" CASCADE;

-- Hoặc xóa tables hoàn toàn
DROP TABLE IF EXISTS "Admin" CASCADE;
DROP TABLE IF EXISTS "Content" CASCADE;
```

Sau đó chạy lại Create Tables (xem Option 2 ở trên).

**Option 2: Delete & Recreate Database**

1. Vercel Dashboard → Storage
2. Click vào `clickads-db`
3. Settings → Delete Database
4. Tạo lại database mới
5. Pull env variables mới
6. Setup lại schema

---

## 🌱 Seed Database

### Seed Local

```bash
npx prisma db seed
```

### Seed Production

**Option 1: Vercel CLI**
```bash
# Set environment to production database
vercel env pull .env.production
$env:DATABASE_URL = (Get-Content .env.production | Select-String "POSTGRES_URL_NON_POOLING" | ForEach-Object { $_ -replace 'POSTGRES_URL_NON_POOLING="', '' -replace '"', '' })

# Run seed
npx prisma db seed
```

**Option 2: Manual SQL (safer)**

Dùng SQL commands trong Vercel Query editor (xem Option 2 Setup Production).

---

## 🔍 Xem Database

### Local

**Prisma Studio:**
```bash
npx prisma studio
```
Mở: http://localhost:5555

**psql (nếu cài PostgreSQL):**
```bash
psql "postgres://..."
```

### Production (Vercel)

**Option 1: Vercel Dashboard**
1. Vercel → Storage → `clickads-db`
2. Tab **Data** → Xem tables trực quan
3. Tab **Query** → Chạy SQL

**Option 2: Prisma Studio với Production DB**
```bash
# Pull production env
vercel env pull .env.production

# Set DATABASE_URL
$env:POSTGRES_URL_NON_POOLING = "paste-production-url-here"

# Open studio
npx prisma studio
```

---

## 📊 Check Database Status

### Kiểm tra Tables tồn tại

**SQL:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Phải thấy: `Admin`, `Content`

### Kiểm tra Admin User

**SQL:**
```sql
SELECT id, username, "createdAt" FROM "Admin";
```

### Kiểm tra Content

**SQL:**
```sql
SELECT id, title FROM "Content";
```

---

## 🚨 Troubleshooting

### Error: "Environment variable not found"

**Giải pháp:**
```bash
# Set trực tiếp trong PowerShell
$env:POSTGRES_URL_NON_POOLING = "your-url-here"
$env:POSTGRES_PRISMA_URL = "your-prisma-url-here"
```

### Error: "Connection timeout"

**Giải pháp:**
1. Check database URL đúng
2. Check internet connection
3. Database có đang chạy không (Vercel dashboard)
4. Thử connection string khác (POSTGRES_URL vs POSTGRES_URL_NON_POOLING)

### Error: "Table already exists"

**Giải pháp:**
Bỏ qua - table đã tồn tại là OK. Hoặc:
```sql
DROP TABLE IF EXISTS "Admin" CASCADE;
DROP TABLE IF EXISTS "Content" CASCADE;
```
Rồi tạo lại.

### Error: Seed failed

**Giải pháp:**
```bash
# Check prisma client đã generate chưa
npx prisma generate

# Check connection
npx prisma db execute --stdin
# Type: SELECT 1; và Enter
```

---

## ✅ Verification Checklist

Sau khi setup, verify:

**Local:**
- [ ] `npx prisma studio` mở được
- [ ] Thấy bảng Admin với 1 user
- [ ] Thấy bảng Content (có thể rỗng hoặc có sample)
- [ ] `npm run dev` chạy được
- [ ] Login admin panel: http://localhost:3000/admin

**Production:**
- [ ] Vercel Storage → Data tab thấy tables
- [ ] Admin table có ít nhất 1 user
- [ ] Website: https://your-app.vercel.app hoạt động
- [ ] Admin login: https://your-app.vercel.app/admin

---

## 🔐 Security Notes

**⚠️ Quan trọng:**

1. **Đổi password admin mặc định** (`admin123`) ngay!
   ```sql
   UPDATE "Admin" 
   SET password = 'NEW_HASHED_PASSWORD'
   WHERE username = 'admin';
   ```

2. **Không commit `.env.local` vào Git** (đã có trong `.gitignore`)

3. **Environment Variables trên Vercel:**
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - NEXTAUTH_SECRET

---

## 📝 Quick Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push schema (no migration)
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

---

## 🎯 Workflow Tổng Quát

### Development Flow
```
1. Sửa schema → prisma/schema.prisma
2. npx prisma db push (hoặc migrate dev)
3. npx prisma db seed (nếu cần)
4. npm run dev
5. Test local
```

### Production Deployment Flow
```
1. git add . && git commit -m "message"
2. git push
3. Vercel auto-deploy
4. Setup database production (1 lần)
5. Test production URL
```

---

**Happy coding! 🚀**
