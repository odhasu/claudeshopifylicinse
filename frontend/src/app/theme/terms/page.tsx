import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/theme" className="text-xs font-semibold text-[#3a0ca3] hover:underline">← Back to home</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Terms of Use</h1>
          <p className="text-sm text-slate-400">Last updated: April 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. License Grant</h2>
            <p>When you purchase Vexel, you receive a non-exclusive, non-transferable license to use the theme on a fixed number of Shopify stores:</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li><strong>Lite</strong> — 1 Shopify store</li>
              <li><strong>Pro</strong> — up to 5 Shopify stores</li>
            </ul>
            <p>Your license is tied to your domain(s). You may not share, sublicense, or resell the theme or your license key to any third party.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Permitted Use</h2>
            <p>You may use Vexel to build and operate your own Shopify store. You may customize the theme&apos;s appearance and content for your business.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Restrictions</h2>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li>Do not reverse-engineer, decompile, or attempt to extract the source code of any protected theme files.</li>
              <li>Do not remove or obscure any Vexel branding, watermarks, or license notices embedded in the theme.</li>
              <li>Do not use the theme on more stores than your plan allows.</li>
              <li>Do not share your license key. Each key is tied to one account and one set of domains.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Updates & Support</h2>
            <p>All purchases include lifetime updates and access to support during our support hours (8AM–8PM CET, Mon–Sun). We reserve the right to change pricing or plan terms for new purchases at any time without affecting existing licenses.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>Vexel is provided as-is. We are not responsible for your store&apos;s revenue, uptime, or any indirect, consequential, or incidental damages arising from your use of the theme. Our total liability to you shall not exceed the amount you paid for your license.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">6. Termination</h2>
            <p>We may revoke your license if you violate these terms. Upon termination, you must cease all use of the theme and remove it from your store(s).</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">7. Contact</h2>
            <p>Questions? <Link href="/theme/support" className="text-[#3a0ca3] hover:underline font-medium">Contact support</Link>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
