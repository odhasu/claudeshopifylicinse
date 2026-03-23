import Link from 'next/link';
import { AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Page not available</h1>
          <p className="text-slate-500 text-base leading-relaxed">
            This page hasn&apos;t been set up yet. Check back soon or reach out to our support team.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/theme"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#3a0ca3] text-white text-sm font-semibold hover:bg-[#2d0980] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/theme/support"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
