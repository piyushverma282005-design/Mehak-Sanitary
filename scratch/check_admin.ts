import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key) {
        process.env[key] = val;
      }
    }
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkAdmin() {
  try {
    const users = await prisma.adminUser.findMany();
    console.log('=== ADMIN USERS IN NEON DB ===');
    console.log('Total admin count:', users.length);
    for (const u of users) {
      console.log(`- ID: ${u.id}, Email: "${u.email}", PasswordHashLength: ${u.passwordHash?.length}`);
    }

    console.log('\n=== ENVIRONMENT SETUP ===');
    console.log('ADMIN_EMAIL env:', process.env.ADMIN_EMAIL || '(not set, default used)');
    console.log('ADMIN_PASSWORD env set:', !!process.env.ADMIN_PASSWORD);
    console.log('RESEND_API_KEY env set:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_FROM_EMAIL env:', process.env.RESEND_FROM_EMAIL || '(not set)');

  } catch (err) {
    console.error('Error querying admin users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
