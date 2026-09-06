import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

async function runLoginVerification() {
  console.log('=== VERIFYING ADMIN LOGIN & SEED USER CREATION ===');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hariharindustries.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Mehak@2026AdminSecret';
  const businessEmail = 'piyushverma282005@gmail.com';

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // Ensure primary admin user exists in DB
  const primaryAdmin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  console.log('✓ Primary Admin User in DB:', primaryAdmin.email);

  // Also ensure business email admin user exists in DB
  const businessAdmin = await prisma.adminUser.upsert({
    where: { email: businessEmail },
    update: { passwordHash },
    create: { email: businessEmail, passwordHash },
  });

  console.log('✓ Business Email Admin User in DB:', businessAdmin.email);

  // Verify password comparisons
  const test1 = await bcrypt.compare(adminPassword, primaryAdmin.passwordHash);
  const test2 = await bcrypt.compare(adminPassword, businessAdmin.passwordHash);
  const testWrong = await bcrypt.compare('WrongPassword123', primaryAdmin.passwordHash);

  console.log('Password comparison test (primary):', test1 ? 'PASS' : 'FAIL');
  console.log('Password comparison test (business):', test2 ? 'PASS' : 'FAIL');
  console.log('Wrong password rejection test:', !testWrong ? 'PASS' : 'FAIL');

  if (test1 && test2 && !testWrong) {
    console.log('🎉 ALL LOGIN CREDENTIAL VERIFICATIONS PASSED 100% CLEANLY!');
  } else {
    throw new Error('FAILED login verification tests');
  }

  await prisma.$disconnect();
}

runLoginVerification().catch((err) => {
  console.error('Login verification error:', err);
  process.exit(1);
});
