import Link from "next/link";
import { Footer } from "@/components/ui/footer-section";

export default function V2AnnouncementPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/theme" className="text-base font-extrabold tracking-tight text-slate-900">Vexel</Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/theme" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href="/theme/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/theme/docs" className="hover:text-slate-900 transition-colors">Docs</Link>
            <Link href="/theme/support" className="hover:text-slate-900 transition-colors">Support</Link>
            <Link href="/theme/news" className="text-slate-900 font-semibold">News</Link>
          </div>
          <Link href="/theme/account" className="px-4 py-2 rounded-lg bg-[#3a0ca3] text-white text-sm font-semibold hover:bg-[#2d0980] transition-colors">
            Portal
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        {/* Back */}
        <Link href="/theme/news" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-10">
          ← Back to News
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-700 border-amber-200">Coming Soon</span>
            <span className="text-xs text-slate-400">April 11, 2026</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight mb-4">
            Vexel V2 Is Coming
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            The biggest update in Vexel history. V2 has been rebuilt from scratch to help your store convert more, load faster, and keep your content fully protected.
          </p>
        </div>

        <div className="h-px bg-slate-200 mb-10" />

        {/* Body */}
        <div className="prose prose-slate max-w-none space-y-10 text-[15px] leading-relaxed text-slate-600">

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">Why V2</h2>
            <p>V1 worked well for stores launching for the first time. But we kept hearing the same requests — content protection, faster loads, more design flexibility, more control without touching code.</p>
            <p className="mt-3">So we rebuilt everything. V2 is faster, looks better, converts higher, and gives you way more control over your store.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">Your content stays yours</h2>
            <p className="mb-4">The #1 request from resellers. V2 makes it significantly harder for anyone to steal your product images or copy your descriptions.</p>
            <ul className="space-y-2.5">
              {[
                ["Images can't be saved", "Right-click save, long-press, and drag-to-desktop are all blocked. Your product photos stay on your store."],
                ["Text can't be copied", "No one can highlight and copy your product titles, descriptions, or pricing. Your listings are yours."],
                ["Works on mobile too", 'The "Save Image" and "Copy" menus that pop up on long-press are blocked across all devices.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3 items-start">
                  <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-[#3a0ca3]/10 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3a0ca3]" />
                  </span>
                  <span><strong className="text-slate-800">{title}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-500">Nothing to install, nothing to configure. It just works the moment you publish V2.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">Faster loads, higher conversions</h2>
            <p>V2 loads noticeably faster than V1. Every section is optimized — less bloat, smarter loading, tighter code. Your customers see your products sooner, and faster stores convert better.</p>
            <p className="mt-3">The new product grid gives you more control over how customers interact with products. Set each button to go to the product page, add to cart, go straight to checkout, show a description popup, or link anywhere you want — and override those settings per product.</p>
            <p className="mt-3">Sale badges, urgency bars, live sales notifications, and the spin-to-win wheel all work together to create urgency and drive conversions. Everything is configurable from the Shopify editor.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">Look premium without hiring a designer</h2>
            <p>V2 comes with 5 premium font families built in — Clash Grotesk, Satoshi, Base Neue, Maison Neue, and Neulis. Mix and match headings, titles, and body text to get a look that feels custom.</p>
            <p className="mt-3">Set your colors once — accent, background, text, cards — and your entire store updates automatically. Dark mode, light mode, bold gradients, clean minimal — controlled from 8 simple settings.</p>
            <p className="mt-3">Product cards come in two styles: <strong className="text-slate-800">Flat</strong> for a clean look, or <strong className="text-slate-800">3D Glass</strong> with depth, frosted effects, and shadows. Both look sharp on every screen size.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">Everything is drag-and-drop</h2>
            <p className="mb-4">Every feature is a section you can add, remove, and reorder right from the Shopify editor. No code needed.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Product Grid with per-product controls",
                "Secondary Grid for multiple collections",
                "FAQ accordion",
                "Customer Reviews with photos",
                "Testimonials carousel",
                "Live Sales notifications",
                "AI Chat widget",
                "Urgency countdown bar",
                "Trust bar",
                "Bundle Builder",
                "Spin-to-Win discount wheel",
                "Background gradient controls",
                "Styled policy pages",
                "Customizable header and footer",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-[#3a0ca3] font-bold">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </section>

          {/* V1 vs V2 table */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4">V1 vs V2</h2>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Feature</th>
                    <th className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide text-center">V1</th>
                    <th className="px-4 py-3 text-[#3a0ca3] font-semibold text-xs uppercase tracking-wide text-center">V2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Image save protection", false, true],
                    ["Text copy protection", false, true],
                    ["Premium font families", "1", "5"],
                    ["Full color customization", false, true],
                    ["3D Glass card style", false, true],
                    ["Per-product button controls", false, true],
                    ["AI Chat", false, true],
                    ["Bundle Builder", false, true],
                    ["Spin-to-Win wheel", false, true],
                    ["Background gradient controls", false, true],
                    ["Styled policy pages", false, true],
                    ["Secondary product grid", false, true],
                    ["Faster page loads", false, true],
                    ["Drag-and-drop sections", "Partial", "Full"],
                  ].map(([feature, v1, v2]) => (
                    <tr key={feature as string} className="bg-white">
                      <td className="px-4 py-3 text-slate-700 font-medium">{feature}</td>
                      <td className="px-4 py-3 text-center">
                        {v1 === false ? <span className="text-slate-300">—</span> : <span className="text-slate-500 font-medium">{v1}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {v2 === true ? <span className="text-[#3a0ca3] font-bold">✓</span> : <span className="text-[#3a0ca3] font-semibold">{v2}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">How to get V2</h2>
            <p><strong className="text-slate-800">Already a Vexel customer?</strong> V2 will be a free upgrade. Same license key, same portal — just download and upload when it drops.</p>
            <p className="mt-3"><strong className="text-slate-800">New here?</strong> V2 is what every new customer will get once it&apos;s live.</p>
            <div className="mt-6">
              <Link href="/theme/account" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3a0ca3] text-white text-sm font-semibold hover:bg-[#2d0980] transition-colors shadow-lg shadow-[#3a0ca3]/20">
                Go to Portal
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
