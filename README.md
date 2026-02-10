# 🎯 Click Ads - Affiliate Video Websitee

Website affiliate thông minh với video blur và redirect logic tự động cho TikTok Shop và Shopee.

**🌟 Features:**
- 📱 Mobile-first với responsive design
- 🎬 2 videos với blur effect + warning overlay
- 🔄 Smart redirect: Mobile (TikTok→Shopee→Play), Desktop (TikTok→Play)
- 👨‍💼 Admin panel để quản lý content
- ☁️ Deploy lên Vercel trong 1 giờ
- 💾 Vercel Postgres + Blob Storage

**📚 Documentation:**
- [🇻🇳 Hướng Dẫn Tiếng Việt](HUONG_DAN_TIENG_VIET.md) - Đọc đầu tiên!
- [🚀 Vercel Deployment](VERCEL_DEPLOYMENT.md) - Step-by-step deploy
- [⚡ Quick Start](QUICK_START.md) - Test ngay 5 phút
- [🏗️ Architecture](ARCHITECTURE.md) - System design
- [✅ Checklist](CHECKLIST.md) - Full checklist

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **Vercel Postgres** (Database)
- **Vercel Blob** (Video Storage)

## 📋 Tính năng

### Trang User
- Hiển thị tiêu đề, mô tả và 2 video
- Video được blur với overlay "Video nhạy cảm"
- Logic redirect thông minh:
  - **Mobile**: Click 1 → TikTok, Click 2 → Shopee, Click 3 → Play video
  - **PC**: Click 1 → TikTok, Click 2 → Play video (không có Shopee)
- Tracking clicks bằng localStorage
- Responsive design

### Trang Admin
- Authentication đơn giản
- Upload 2 videos lên Vercel Blob
- Quản lý tiêu đề, nội dung
- Set link TikTok và Shopee
- CRUD content

## 🛠️ Setup Local Development

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Setup Database (Option 1: PostgreSQL Local)

Cài đặt PostgreSQL trên máy local, sau đó tạo database:

```bash
# PostgreSQL command
createdb clickads
```

File `.env.local` đã được config sẵn cho local PostgreSQL.

### 3. Setup Database (Option 2: Vercel Postgres cho Development)

Nếu không muốn cài PostgreSQL local, bạn có thể dùng Vercel Postgres ngay:

1. Tạo project trên Vercel
2. Vào Storage → Create Database → Postgres
3. Copy các environment variables vào `.env.local`

### 4. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed database (tạo admin user)

```bash
npx prisma db seed
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`

### 6. Start development server

```bash
npm run dev
```

Website sẽ chạy tại: http://localhost:3000

- User page: http://localhost:3000
- Admin page: http://localhost:3000/admin

## 📦 Deploy lên Vercel

### 1. Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Import project vào Vercel

1. Đăng nhập https://vercel.com
2. Click "Add New" → "Project"
3. Import repository từ GitHub
4. Vercel sẽ tự detect Next.js

### 3. Setup Vercel Postgres

1. Trong Vercel project → Storage tab
2. Create Database → Postgres
3. Vercel sẽ tự động add environment variables

### 4. Setup Vercel Blob

1. Trong Vercel project → Storage tab
2. Create Store → Blob
3. Copy `BLOB_READ_WRITE_TOKEN`
4. Add vào Environment Variables

### 5. Add Environment Variables

Vào Settings → Environment Variables, thêm:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
NEXTAUTH_SECRET=your-secret-key-here
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 6. Run Prisma migrations trên Vercel

Sau khi deploy, chạy migrations:

```bash
# Vào Vercel Dashboard → Settings → Environment Variables
# Hoặc dùng Vercel CLI
vercel env pull
npx prisma migrate deploy
```

### 7. Seed database (tạo admin user)

Tạo admin user trên production:

```bash
# Option 1: Local với connection string của Vercel
DATABASE_URL="<vercel-postgres-url>" npx prisma db seed

# Option 2: Tạo API route để seed (không khuyến khích)
```

**Hoặc tốt hơn**: Tạo admin user trực tiếp qua Vercel Postgres dashboard SQL editor:

```sql
INSERT INTO "Admin" (id, username, password, "createdAt")
VALUES (
  'cm-admin-id',
  'admin',
  '$2a$10$encrypted-password-here',
  NOW()
);
```

Để hash password:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

## 🎯 Sử dụng

### Admin Panel

1. Truy cập `/admin`
2. Login với credentials đã set
3. Upload 2 videos
4. Nhập tiêu đề, mô tả
5. Set link TikTok và Shopee
6. Save

### User Page

1. User truy cập `/` (homepage)
2. Thấy 2 videos bị blur
3. Click vào video:
   - **Mobile**: Lần 1 → TikTok, Lần 2 → Shopee, Lần 3 → Xem được video
   - **PC**: Lần 1 → TikTok, Lần 2 → Xem được video

## 🔧 Testing

Reset click count (for testing):
- Mở trang user
- Click nút "Reset Click Count" ở cuối trang
- Hoặc clear localStorage trong DevTools

## 📝 Notes

- Video upload size limit: Vercel Blob free tier có limit 100MB/file
- Database: Vercel Postgres free tier có limit storage
- Click tracking: Dùng localStorage nên user có thể reset bằng cách clear browser data
- Authentication: Đơn giản với localStorage, production nên dùng NextAuth hoặc session-based auth

## 🔐 Security

**⚠️ QUAN TRỌNG**: Đổi các credentials sau khi deploy:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` 
- `NEXTAUTH_SECRET`

## 📄 License

MIT
