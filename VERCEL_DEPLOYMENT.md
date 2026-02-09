# 🚀 Vercel Deployment - Step by Step

## Phase 1: Local Testing (5 minutes)

### Step 1: Install Dependencies
```bash
cd c:\An\click_ads
npm install
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Start Dev Server
```bash
npm run dev
```

### Step 4: Test
Open http://localhost:3000
- ✅ Page loads with mock data
- ✅ Videos are blurred
- ✅ Click tracking works

---

## Phase 2: GitHub Setup (5 minutes)

### Step 1: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Click Ads Affiliate Website"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `click-ads`
3. Make it **Public**
4. **Don't** initialize with README (we have one)
5. Click **Create repository**

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/click-ads.git
git branch -M main
git push -u origin main
```

---

## Phase 3: Vercel Account Setup (3 minutes)

### Step 1: Sign Up
1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel

---

## Phase 4: Create Vercel Project (2 minutes)

### Step 1: Import Repository
1. Click **Add New** → **Project**
2. Find `click-ads` repository
3. Click **Import**

### Step 2: Configure Build Settings
**DON'T CLICK DEPLOY YET!**

Vercel auto-detects:
- Framework Preset: **Next.js**
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

Leave these as default.

---

## Phase 5: Setup Vercel Postgres (5 minutes)

### Step 1: Create Database
1. In project page, click **Storage** tab
2. Click **Create Database**
3. Choose **Postgres**
4. Settings:
   - Name: `clickads-db`
   - Region: **Singapore** (closest to Vietnam)
5. Click **Create**

### Step 2: Verify Environment Variables
Vercel auto-adds these:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

✅ Check: Go to **Settings** → **Environment Variables** to see them

---

## Phase 6: Setup Vercel Blob (3 minutes)

### Step 1: Create Blob Storage
1. Still in **Storage** tab
2. Click **Create Store**
3. Choose **Blob**
4. Settings:
   - Name: `clickads-videos`
5. Click **Create**

### Step 2: Verify Token
Vercel auto-adds:
- `BLOB_READ_WRITE_TOKEN`

✅ Check in **Settings** → **Environment Variables**

---

## Phase 7: Add Custom Environment Variables (5 minutes)

### Step 1: Go to Settings
**Settings** → **Environment Variables**

### Step 2: Add Variables

**ADMIN_USERNAME:**
- Key: `ADMIN_USERNAME`
- Value: `admin` (or your choice)
- Environment: **Production**, **Preview**, **Development**
- Click **Save**

**ADMIN_PASSWORD:**
- Key: `ADMIN_PASSWORD`
- Value: `YourSecurePassword123!` (CHANGE THIS!)
- Environment: **Production**, **Preview**, **Development**
- Click **Save**

**NEXTAUTH_SECRET:**
Generate first:
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use: https://generate-secret.vercel.app/32
```

- Key: `NEXTAUTH_SECRET`
- Value: `[paste generated secret]`
- Environment: **Production**, **Preview**, **Development**
- Click **Save**

---

## Phase 8: Deploy! (5 minutes)

### Step 1: Trigger Deployment
1. Go to **Deployments** tab
2. Click **Redeploy** (if auto-deployed)
   - OR click **Deploy** if not deployed yet

### Step 2: Wait
⏳ Deployment takes ~2-3 minutes

Watch the build logs:
- Installing dependencies
- Building application
- Uploading build assets

### Step 3: Deployment Complete
✅ You'll see: **"Deployment Ready"**

---

## Phase 9: Setup Database Schema (10 minutes)

### Option A: Using Vercel CLI (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```
Follow prompts to authenticate.

**Step 3: Link Project**
```bash
cd c:\An\click_ads
vercel link
```
- Select your team (or personal account)
- Select project `click-ads`
- Link to existing project: **Yes**

**Step 4: Pull Environment Variables**
```bash
vercel env pull .env.local
```

**Step 5: Run Migrations**
```bash
npx prisma migrate deploy
```

**Step 6: Seed Database**
```bash
npx prisma db seed
```

✅ Admin user created!

### Option B: Manual SQL (If CLI doesn't work)

**Step 1: Get Database URL**
1. Go to **Storage** → **Postgres** → `clickads-db`
2. Copy **POSTGRES_URL_NON_POOLING**

**Step 2: Run Migrations Locally**
```bash
# In PowerShell
$env:DATABASE_URL="postgresql://[paste-url-here]"
npx prisma migrate deploy
```

**Step 3: Create Admin via SQL**
1. In Vercel: **Storage** → **Postgres** → **Query** tab
2. Run this SQL:

```sql
-- Create Admin table (if not exists)
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Admin_username_key" UNIQUE ("username")
);

-- Create Content table (if not exists)
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

**Step 4: Hash Password**
```bash
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```
Copy the output (starts with `$2a$10$...`)

**Step 5: Insert Admin**
Back in Vercel SQL Query:
```sql
INSERT INTO "Admin" ("id", "username", "password", "createdAt")
VALUES (
    'admin-' || gen_random_uuid(),
    'admin',
    '$2a$10$[paste-hashed-password-here]',
    NOW()
);
```

---

## Phase 10: Testing (10 minutes)

### Step 1: Get Your URL
From Vercel Deployments, click **Visit** or copy URL:
```
https://click-ads-xyz123.vercel.app
```

### Step 2: Test User Page
1. Open the URL
2. Should see: Title, description, blurred videos
3. Try clicking video
4. Should redirect to mock TikTok link

### Step 3: Test Admin Login
1. Go to: `https://your-url.vercel.app/admin`
2. Login:
   - Username: `admin`
   - Password: `admin123` (or what you set)
3. Should see admin dashboard

### Step 4: Upload Content
1. Enter title: "Test Video"
2. Enter description: "Testing affiliate system"
3. Upload 2 videos (or use URLs for testing):
   ```
   https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
   ```
4. TikTok link: Your actual TikTok Shop link
5. Shopee link: Your actual Shopee affiliate link
6. Click **Save**

### Step 5: Verify User Page
1. Go back to homepage
2. Should see your content
3. Videos should be blurred
4. Test click flow:
   - Mobile (resize browser < 768px): TikTok → Shopee → Play
   - Desktop: TikTok → Play

---

## Phase 11: Final Configuration (5 minutes)

### Add Custom Domain (Optional)
1. **Settings** → **Domains**
2. Add your domain
3. Update DNS as instructed
4. Wait for DNS propagation

### Enable Analytics (Free)
1. **Analytics** tab
2. Enable **Vercel Analytics**
3. Track visitor metrics

### Enable Speed Insights (Optional)
1. **Speed Insights** tab
2. Enable monitoring
3. Track Core Web Vitals

---

## Troubleshooting

### Build Failed
**Error:** `Prisma Client not generated`

**Solution:**
1. Check `vercel.json` has:
   ```json
   {
     "buildCommand": "prisma generate && next build"
   }
   ```
2. Redeploy

### Can't Login to Admin
**Error:** Invalid credentials

**Solution:**
1. Check database has Admin table
2. Run seed script again
3. Or insert admin manually via SQL

### Videos Not Uploading
**Error:** Upload failed

**Solution:**
1. Check `BLOB_READ_WRITE_TOKEN` exists
2. Verify Blob storage created
3. Check file size < 100MB
4. Try uploading smaller test video

### Redirects Not Working
**Error:** Links don't open

**Solution:**
1. Check links are valid URLs
2. Test links manually
3. Check browser popup blocker
4. Use `window.open()` instead of redirect

---

## Success Checklist ✅

- [ ] Local dev server runs
- [ ] Pushed to GitHub
- [ ] Imported to Vercel
- [ ] Postgres database created
- [ ] Blob storage created
- [ ] Environment variables set
- [ ] Deployed successfully
- [ ] Database schema created
- [ ] Admin user created
- [ ] Admin login works
- [ ] Can upload content
- [ ] User page displays content
- [ ] Click tracking works
- [ ] Redirects work on mobile
- [ ] Redirects work on desktop
- [ ] Videos play after clicks

---

## Quick Commands Reference

```bash
# Local Development
npm install
npx prisma generate
npm run dev

# Database
npx prisma migrate dev
npx prisma db seed
npx prisma studio  # View database

# Vercel CLI
npm install -g vercel
vercel login
vercel link
vercel env pull
vercel deploy

# Git
git add .
git commit -m "message"
git push

# Generate Secret
# PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Hash Password
node -e "console.log(require('bcryptjs').hashSync('password', 10))"
```

---

## Total Time Estimate

- Local Testing: 5 min
- GitHub Setup: 5 min
- Vercel Account: 3 min
- Create Project: 2 min
- Setup Postgres: 5 min
- Setup Blob: 3 min
- Environment Vars: 5 min
- Deploy: 5 min
- Database Setup: 10 min
- Testing: 10 min
- Final Config: 5 min

**Total: ~60 minutes** ⏱️

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **This Project's Docs:** See README.md, DEPLOY_GUIDE.md

---

**Good luck with your deployment! 🚀**
