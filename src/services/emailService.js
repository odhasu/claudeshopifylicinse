const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM    = process.env.RESEND_FROM_EMAIL || 'noreply@vexel.app';
const SITE_URL       = process.env.SITE_URL || 'https://claudecodethemeshopify.vercel.app';

function getResend() {
  if (!RESEND_API_KEY) return null;
  const { Resend } = require('resend');
  return new Resend(RESEND_API_KEY);
}

async function sendWelcomeEmail({ email, name, licenseKey, plan }) {
  const resend = getResend();
  if (!resend || !email) {
    console.log('[Email] Skipping — Resend not configured or no email address');
    return;
  }
  const planKey = (plan || 'LITE').toUpperCase() === 'PRO' ? 'PRO' : 'LITE';
  const planName = planKey === 'PRO' ? 'Vexel Pro' : 'Vexel Lite';
  const loginUrl = `${SITE_URL}/theme/account`;

  const planFeatures = planKey === 'PRO'
    ? ['Full theme with 140+ features', '3 store licenses', '1-on-1 full store setup call',
       'Unlimited store remakes if banned', 'Private Vexel community access', 'Priority support',
       'Done-for-you product listings', 'Lifetime updates']
    : ['Full theme with 140+ features', '1 store license', 'Product image generator',
       'Product list generator', 'Built-in setup support', 'Complete documentation', 'Lifetime updates'];

  const featuresHtml = planFeatures.map(f => `<li style="padding:4px 0;color:#475569;">${f}</li>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:#3a0ca3;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Welcome to Vexel</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your ${planName} purchase is confirmed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
              ${name ? `Hi ${name},<br><br>` : ''}Thank you for your purchase! Your license is ready to use.
            </p>
            <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:700;">Your License Key</h2>
              <p style="margin:0;font-family:monospace;font-size:18px;font-weight:700;color:#3a0ca3;letter-spacing:2px;">${licenseKey}</p>
              <p style="margin:12px 0 0;color:#94a3b8;font-size:11px;">Enter this key in your Shopify theme settings to activate. Keep it safe &mdash; it&rsquo;s tied to your purchase.</p>
            </div>
            <div style="margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:700;">How to Get Started</h2>
              <ol style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
                <li>Go to your account page and download the Vexel theme ZIP</li>
                <li>Upload the theme to your Shopify store</li>
                <li>Enter your license key in the theme settings to activate</li>
                <li>Customise and publish your store</li>
              </ol>
            </div>
            <div style="text-align:center;margin:28px 0;">
              <a href="${loginUrl}" style="display:inline-block;background:#3a0ca3;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">Go to My Account &rarr;</a>
            </div>
            <div style="background:#f8f6ff;border:1px solid #e9e5f5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#3a0ca3;font-size:16px;font-weight:700;">What&rsquo;s Included in ${planName}</h2>
              <ul style="margin:0;padding-left:20px;list-style:disc;font-size:13px;line-height:1.6;">${featuresHtml}</ul>
            </div>
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;">
              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                Need help? Visit our <a href="${SITE_URL}/theme/docs" style="color:#3a0ca3;font-weight:600;">documentation</a> or reach out to <a href="${SITE_URL}/theme/support" style="color:#3a0ca3;font-weight:600;">support</a>.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">Vexel &mdash; Premium Shopify Theme</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: `Your ${planName} License Key`,
      html,
    });
    console.log(`[Email] Welcome email sent to ${email}`, result?.data?.id || '');
  } catch (err) {
    console.error('[Email] Failed to send welcome email:', err.message);
  }
}

async function sendTicketReplyEmail({ email, name, message, ticketId }) {
  const resend = getResend();
  if (!resend || !email) {
    console.log('[Email] Skipping ticket reply — Resend not configured or no email address');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:#3a0ca3;padding:24px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Support Reply</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 16px;">
              ${name ? `Hi ${name},` : 'Hi,'}
            </p>
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
              We've replied to your support ticket:
            </p>
            <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="color:#64748b;font-size:13px;margin:0;">
              If you need further help, reply to this email or visit our <a href="${SITE_URL}/theme/support" style="color:#3a0ca3;font-weight:600;">support page</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">Vexel Support &mdash; Ticket #${ticketId}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: `Re: Your Support Ticket #${ticketId}`,
      html,
    });
    console.log(`[Email] Ticket reply sent to ${email}`, result?.data?.id || '');
  } catch (err) {
    console.error('[Email] Failed to send ticket reply:', err.message);
  }
}

module.exports = { sendWelcomeEmail, sendTicketReplyEmail, SITE_URL };
