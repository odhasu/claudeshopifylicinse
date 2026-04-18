import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/theme" className="text-xs font-semibold text-[#3a0ca3] hover:underline">← Back to home</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Refund Policy</h1>
          <p className="text-sm text-slate-400">Last updated: April 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 text-sm leading-relaxed text-slate-700">

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">General Policy</h2>
            <p>All sales are final. Once a license key has been issued and the theme has been made available for download, we do not offer refunds.</p>
            <p>Digital products cannot be &quot;returned&quot; in the traditional sense — once delivered, the value has been received. This policy exists to protect the integrity of the product and our business.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Exceptions</h2>
            <p>We may offer a refund at our sole discretion if:</p>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              <li>You request a refund within <strong>7 days</strong> of purchase</li>
              <li>You have not downloaded or activated the theme</li>
              <li>There is a technical issue on our end that we are unable to resolve</li>
            </ul>
            <p>Refund requests after 7 days will not be considered under any circumstances.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">How to Request a Refund</h2>
            <p>If you believe you qualify for a refund, <Link href="/theme/support" className="text-[#3a0ca3] hover:underline font-medium">contact support</Link> within 7 days of purchase with your order details. We will review your request and respond within 1–2 business days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Chargebacks</h2>
            <p>Initiating a chargeback without contacting us first will result in immediate license revocation and may result in being banned from future purchases.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Contact</h2>
            <p>Questions? <Link href="/theme/support" className="text-[#3a0ca3] hover:underline font-medium">Contact support</Link>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
