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

  // Optionally create sample content
  const existingContent = await prisma.content.findFirst();
  
  if (!existingContent) {
    const sampleContent = await prisma.content.create({
      data: {
        title: 'Sample Video Content',
        description: 'This is a sample content. Please update from admin panel.',
        video1Url: 'https://example.com/video1.mp4',
        video2Url: 'https://example.com/video2.mp4',
        tiktokLink: 'https://vt.tiktok.com/example',
        shopeeLink: 'https://s.shopee.vn/example',
      },
    });
    console.log('✅ Sample content created:', sampleContent.id);
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
