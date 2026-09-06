import { verifyJwtEdge } from '../src/lib/jwtEdge';
import { checkRateLimit } from '../src/lib/rateLimit';
import { businessSettingsSchema, changePasswordSchema } from '../src/lib/validations';
import { hashPassword, verifyPassword } from '../src/lib/auth';

async function runSecurityTests() {
  console.log('=== RUNNING SECURITY HARDENING SUITE ===');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Rate Limiting
  const r1 = checkRateLimit('test-ip-1', { limit: 2, windowMs: 10000 });
  const r2 = checkRateLimit('test-ip-1', { limit: 2, windowMs: 10000 });
  const r3 = checkRateLimit('test-ip-1', { limit: 2, windowMs: 10000 });
  assert(r1.success && r2.success && !r3.success, 'Rate Limiting throttles excess requests');

  // Test 2: URL Sanitization & Protocol Validation
  const validSettings = businessSettingsSchema.safeParse({
    name: 'Hari Har Industries',
    brand: 'Mehak',
    tagline: 'Complete Bathroom Solution',
    description: 'Test description',
    phonePrimary: '8307721917',
    whatsapp: '8307721917',
    email: 'piyushverma282005@gmail.com',
    address: 'Sector 5',
    city: 'Faridabad',
    state: 'Haryana',
    pincode: '121006',
    country: 'India',
    googleMapsUrl: 'https://maps.google.com/?q=faridabad',
  });
  assert(validSettings.success, 'Valid https:// URL accepted in business settings');

  const javascriptUrlSettings = businessSettingsSchema.safeParse({
    name: 'Hari Har Industries',
    brand: 'Mehak',
    tagline: 'Complete Bathroom Solution',
    description: 'Test description',
    phonePrimary: '8307721917',
    whatsapp: '8307721917',
    email: 'piyushverma282005@gmail.com',
    address: 'Sector 5',
    city: 'Faridabad',
    state: 'Haryana',
    pincode: '121006',
    country: 'India',
    googleMapsUrl: 'javascript:alert(1)',
  });
  assert(!javascriptUrlSettings.success, 'Malicious javascript: URL scheme rejected in business settings');

  // Test 3: Password Complexity & Change Password Validation
  const weakPassword = changePasswordSchema.safeParse({
    currentPassword: 'Password123!',
    newPassword: 'short',
    confirmPassword: 'short',
  });
  assert(!weakPassword.success, 'Passwords under 8 characters rejected');

  const mismatchedPassword = changePasswordSchema.safeParse({
    currentPassword: 'Password123!',
    newPassword: 'StrongPassword1',
    confirmPassword: 'StrongPassword2',
  });
  assert(!mismatchedPassword.success, 'Mismatched confirm password rejected');

  const validChange = changePasswordSchema.safeParse({
    currentPassword: 'Password123!',
    newPassword: 'StrongPassword1',
    confirmPassword: 'StrongPassword1',
  });
  assert(validChange.success, 'Valid password change payload accepted');

  // Test 4: Bcrypt Hash & Verification
  const hashed = await hashPassword('MySecretPass123');
  const validComp = await verifyPassword('MySecretPass123', hashed);
  const invalidComp = await verifyPassword('WrongPass', hashed);
  assert(validComp && !invalidComp, 'Bcrypt password hashing and verification is correct');

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
