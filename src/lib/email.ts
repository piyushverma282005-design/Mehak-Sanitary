import crypto from 'crypto';

interface SendPasswordResetEmailParams {
  toEmail: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({ toEmail, resetToken }: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ADMIN_EMAIL_FROM || 'Mehak Sanitary Admin <onboarding@resend.dev>';
  
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL 
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
    : 'https://mehak-sanitary.vercel.app');

  const appUrl = rawAppUrl.startsWith('http://') || rawAppUrl.startsWith('https://') 
    ? rawAppUrl.replace(/\/$/, '') 
    : `https://${rawAppUrl.replace(/\/$/, '')}`;

  const resetUrl = `${appUrl}/admin/reset-password?token=${resetToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 20px; text-align: left; }
          .text { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px; }
          .btn-container { text-align: left; margin: 28px 0; }
          .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; }
          .subtext { font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5; }
          .signature { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="title">Mehak Sanitary Hardware</h1>
          <p class="text">Hello,</p>
          <p class="text">We received a request to reset your Mehak Admin password.</p>
          <p class="text">Click the button below to create a new password:</p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p class="subtext">This link will expire after 30 minutes.</p>
          <p class="subtext">If you did not request this, you can safely ignore this email.</p>
          <div class="signature">
            Thanks,<br>
            Mehak Sanitary Hardware
          </div>
        </div>
      </body>
    </html>
  `;

  if (!apiKey) {
    console.warn('[EMAIL WARNING] RESEND_API_KEY environment variable is not configured. Reset token generated in DB, but email dispatch requires RESEND_API_KEY in Vercel.');
    return { success: false, error: 'RESEND_API_KEY_MISSING' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: 'Reset your Mehak Admin password',
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('[EMAIL ERROR] Resend API error response:', errData);
      return { success: false, error: errData.message || 'Resend API error' };
    }

    return { success: true };
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send email via Resend:', err);
    return { success: false, error: 'Network or Resend fetch error' };
  }
}
