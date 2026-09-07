import fs from 'fs';
import path from 'path';

async function testMobileAppStructure() {
  console.log('=== VERIFYING MEHAK ADMIN MOBILE APP ARCHITECTURE ===');

  const mobileRoot = path.join(process.cwd(), 'mehak-admin-mobile');
  const requiredFiles = [
    'package.json',
    'app.json',
    'tsconfig.json',
    'App.tsx',
    'src/types/index.ts',
    'src/api/client.ts',
    'src/services/auth.ts',
    'src/services/products.ts',
    'src/services/categories.ts',
    'src/services/enquiries.ts',
    'src/services/settings.ts',
    'src/services/upload.ts',
    'src/context/AuthContext.tsx',
    'src/screens/LoginScreen.tsx',
    'src/screens/DashboardScreen.tsx',
    'src/screens/ProductsScreen.tsx',
    'src/screens/AddEditProductScreen.tsx',
    'src/screens/CategoriesScreen.tsx',
    'src/screens/EnquiriesScreen.tsx',
    'src/screens/EnquiryDetailScreen.tsx',
    'src/screens/SettingsScreen.tsx',
  ];

  let passed = 0;
  for (const relFile of requiredFiles) {
    const fullPath = path.join(mobileRoot, relFile);
    if (fs.existsSync(fullPath)) {
      console.log(`[PASS] Exists: mehak-admin-mobile/${relFile}`);
      passed++;
    } else {
      console.error(`[FAIL] Missing: mehak-admin-mobile/${relFile}`);
    }
  }

  console.log(`\n=== RESULTS: ${passed}/${requiredFiles.length} Mobile Files Verified ===`);
  if (passed !== requiredFiles.length) {
    process.exit(1);
  }
}

testMobileAppStructure().catch((err) => {
  console.error('Mobile app verification error:', err);
  process.exit(1);
});
