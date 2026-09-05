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
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #334155; }
          .brand { font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
          .subtitle { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
          .content { padding: 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #ffffff; color: #0f172a; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 0.1); }
          .notice { font-size: 12px; color: #64748b; margin-top: 20px; word-break: break-all; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">Mehak Sanitary Hardware</h1>
            <p class="subtitle">Administrator Account Security</p>
          </div>
          <div class="content">
            <p>Hello Administrator,</p>
            <p>A password reset was requested for your Mehak Sanitary Admin account (<strong>${toEmail}</strong>).</p>
            <p>Click the button below to reset your password. This link is valid for <strong>30 minutes</strong> and can only be used once:</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Admin Password</a>
            </div>
            <p class="notice">
              If the button above does not work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color: #94a3b8;">${resetUrl}</a>
            </p>
            <p style="margin-top: 20px;">If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.</p>
          </div>
          <div class="footer">
            Mehak Sanitary Hardware — Confidential & Restricted Admin Portal
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
        subject: 'Password Reset Request — Mehak Admin Portal',
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
