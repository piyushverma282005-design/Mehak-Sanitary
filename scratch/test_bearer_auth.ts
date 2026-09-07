import { createSessionToken, getAdminSession } from '../src/lib/auth';

async function testBearerAuth() {
  console.log('=== TESTING BEARER AUTHORIZATION HEADER SUPPORT ===');

  const testPayload = { id: 'test-admin-id', email: 'piyushverma282005@gmail.com' };
  const token = createSessionToken(testPayload);

  // Mock Request with Authorization: Bearer <token> header
  const reqWithHeader = new Request('http://localhost:3000/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const sessionFromHeader = await getAdminSession(reqWithHeader);

  console.log('Session extracted from Bearer header:', sessionFromHeader);

  if (sessionFromHeader && sessionFromHeader.email === testPayload.email) {
    console.log('✅ BEARER HEADER AUTHORIZATION TEST PASSED 100% CLEANLY!');
  } else {
    throw new Error('FAILED Bearer header authorization test');
  }
}

testBearerAuth().catch((err) => {
  console.error('Bearer test error:', err);
  process.exit(1);
});
