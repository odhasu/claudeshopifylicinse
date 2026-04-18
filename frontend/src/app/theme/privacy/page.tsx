import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/theme" className="text-xs font-semibold text-[#3a0ca3] hover:underline">← Back to home</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: April 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. What We Collect</h2>
            <p>When you purchase or use Vexel, we collect:</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li><strong>Email address</strong> — for license delivery and support communication</li>
              <li><strong>Shopify domain</strong> — to validate your license on every page load</li>
              <li><strong>Payment information</strong> — processed by Stripe; we never store your card details</li>
              <li><strong>Support messages</strong> — messages you send through our contact form</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. How We Use It</h2>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li>To deliver your license key and theme download</li>
              <li>To validate your license when your store loads</li>
              <li>To respond to support tickets</li>
              <li>To send important updates about your license (e.g. expiry reminders)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Storage & Security</h2>
            <p>Your license data is stored securely in an encrypted Redis database (Upstash). We do not store payment card details — all payment processing is handled by Stripe, which is PCI-DSS compliant.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Data Sharing</h2>
            <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. We use the following service providers, who may process your data as part of delivering our service:</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Upstash</strong> — license data storage</li>
              <li><strong>Vercel</strong> — hosting</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Your Rights</h2>
            <p>You may request deletion of your data at any time by contacting support. Note that deleting your data will revoke your license.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">6. Contact</h2>
            <p>Privacy questions? <Link href="/theme/support" className="text-[#3a0ca3] hover:underline font-medium">Contact support</Link>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
