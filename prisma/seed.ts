import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { username: process.env.ADMIN_USERNAME || 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.username);

  // Create sample pages
  const existingPages = await prisma.page.count();
  
  if (existingPages === 0) {
    const page1 = await prisma.page.create({
      data: {
        slug: '1',
        title: 'Trang 1 - Video Hot',
        description: 'Nội dung trang 1. Cập nhật từ admin panel.',
        video1Url: 'https://example.com/video1.mp4',
        video2Url: 'https://example.com/video2.mp4',
        tiktokLink: 'https://vt.tiktok.com/example1',
        shopeeLink: 'https://s.shopee.vn/example1',
        isActive: true,
      },
    });

    const page2 = await prisma.page.create({
      data: {
        slug: '2',
        title: 'Trang 2 - Trending',
        description: 'Nội dung trang 2. Cập nhật từ admin panel.',
        video1Url: 'https://example.com/video3.mp4',
        video2Url: 'https://example.com/video4.mp4',
        tiktokLink: 'https://vt.tiktok.com/example2',
        shopeeLink: 'https://s.shopee.vn/example2',
        isActive: true,
      },
    });
    
    console.log('✅ Sample pages created:', page1.slug, page2.slug);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
