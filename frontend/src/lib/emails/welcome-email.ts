interface WelcomeEmailProps {
  email: string;
  password: string;
  plan: 'LITE' | 'PRO';
  loginUrl: string;
}

const PLAN_DETAILS: Record<'LITE' | 'PRO', { name: string; features: string[] }> = {
  LITE: {
    name: 'Vexel Lite',
    features: [
      'Full theme with 140+ features',
      '1 store license',
      'Product image generator',
      'Product list generator',
      'Built-in setup support',
      'Complete documentation',
      'Lifetime updates',
    ],
  },
  PRO: {
    name: 'Vexel Pro',
    features: [
      'Full theme with 140+ features',
      '3 store licenses',
      '1-on-1 full store setup call',
      'Unlimited store remakes if banned',
      'Private Vexel community access',
      'Priority support',
      'Done-for-you product listings',
      'Lifetime updates',
    ],
  },
};

export function buildWelcomeEmailHtml({ email, password, plan, loginUrl }: WelcomeEmailProps): string {
  const details = PLAN_DETAILS[plan];

  const featuresHtml = details.features
    .map((f) => `<li style="padding: 4px 0; color: #475569;">${f}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background:#3a0ca3;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Welcome to Vexel</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your ${details.name} purchase is confirmed</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Thank you for your purchase! Your account has been created and your license is ready to go. Here&rsquo;s everything you need to get started:
            </p>

            <!-- Login credentials -->
            <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:700;">Your Login Details</h2>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:4px 0;color:#64748b;font-size:13px;width:80px;">Email:</td>
                  <td style="padding:4px 0;color:#0f172a;font-size:13px;font-weight:600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#64748b;font-size:13px;">Password:</td>
                  <td style="padding:4px 0;color:#0f172a;font-size:13px;font-weight:600;font-family:monospace;">${password}</td>
                </tr>
              </table>
              <p style="margin:12px 0 0;color:#94a3b8;font-size:11px;">We recommend changing your password after your first login.</p>
            </div>

            <!-- How to log in -->
            <div style="margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:700;">How to Get Started</h2>
              <ol style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
                <li>Click the button below to log in to your account</li>
                <li>Find your license key and API key on the Account page</li>
                <li>Download and install the Vexel theme in your Shopify store</li>
                <li>Enter your license key to activate the theme</li>
                <li>Change your password under your profile settings</li>
              </ol>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin:28px 0;">
              <a href="${loginUrl}" style="display:inline-block;background:#3a0ca3;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">
                Log In to Your Account →
              </a>
            </div>

            <!-- What you receive -->
            <div style="background:#f8f6ff;border:1px solid #e9e5f5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <h2 style="margin:0 0 12px;color:#3a0ca3;font-size:16px;font-weight:700;">What&rsquo;s Included in ${details.name}</h2>
              <ul style="margin:0;padding-left:20px;list-style:disc;font-size:13px;line-height:1.6;">
                ${featuresHtml}
              </ul>
            </div>

            <!-- Support -->
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:8px;">
              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                Need help? Visit our <a href="${loginUrl.replace('/account', '/docs')}" style="color:#3a0ca3;font-weight:600;">documentation</a> or reach out to <a href="${loginUrl.replace('/account', '/support')}" style="color:#3a0ca3;font-weight:600;">support</a>. We&rsquo;re happy to help you get set up!
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">Vexel — Premium Shopify Theme</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
