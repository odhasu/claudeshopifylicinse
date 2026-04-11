import Link from "next/link";
import { Footer } from "@/components/ui/footer-section";

const posts = [
  {
    slug: "vexel-v2-announcement",
    tag: "Coming Soon",
    tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    date: "April 11, 2026",
    title: "Vexel V2 Is Coming",
    summary:
      "V2 is a full rebuild. Image & text protection, 5 premium fonts, 3D glass cards, per-product button controls, spin-to-win, AI chat, bundle builder, and significantly faster load times.",
  },
];

export default function NewsPage() {
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

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3a0ca3] mb-3">Updates & Releases</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">News</h1>
        </div>

        <div className="space-y-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/theme/news/${post.slug}`}
              className="group block rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${post.tagColor}`}>
                  {post.tag}
                </span>
                <span className="text-xs text-slate-400">{post.date}</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-[#3a0ca3] transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">{post.summary}</p>
              <p className="mt-4 text-xs font-semibold text-[#3a0ca3] group-hover:underline">Read more →</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
