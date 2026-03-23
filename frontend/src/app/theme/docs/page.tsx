"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Rocket,
  Key,
  Palette,
  Zap,
  Wrench,
  FileText,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Menu,
  X,
} from "lucide-react";

const SIDEBAR_NAV = [
  {
    id: "getting-started",
    section: "Getting Started",
    items: [
      "Quick Start Guide",
      "Downloading Your Theme",
      "Installing in Shopify",
      "After Your Purchase",
    ],
  },
  {
    id: "license-domain",
    section: "License & Domain",
    items: [
      "Understanding Your License",
      "Auto-Generated Shopify Domains",
      "License Activation Step-by-Step",
      "Finding Your Auto-Generated Domain",
      "Activated on Wrong Domain?",
      "Custom Domains and Your License",
    ],
  },
  {
    id: "theme-customization",
    section: "Theme Customization",
    items: [
      "Colors & Branding Setup",
      "Accessing the Theme Editor",
      "Changing Theme Language",
    ],
  },
  {
    id: "feature-guides",
    section: "Feature Guides",
    items: [
      "AI Chatbot Setup",
      "Spin Wheel Setup",
      "Bundle Builder Setup",
      "Urgency Elements Setup",
      "Product Grid Setup",
      "Reviews & Testimonials",
    ],
  },
];

const CATEGORIES = [
  {
    icon: Rocket,
    title: "Getting Started",
    subtitle: "Purchase to live store in 15 min",
    count: 4,
    iconClass: "text-violet-600",
    firstArticle: "Quick Start Guide",
  },
  {
    icon: Key,
    title: "License & Domain",
    subtitle: "Understanding your license and activation",
    count: 6,
    iconClass: "text-violet-600",
    firstArticle: "Understanding Your License",
  },
  {
    icon: Palette,
    title: "Theme Customization",
    subtitle: "Colors, branding, and feature setup",
    count: 3,
    iconClass: "text-violet-600",
    firstArticle: "Colors & Branding Setup",
  },
  {
    icon: Zap,
    title: "Feature Guides",
    subtitle: "AI chatbot, spin wheel, bundles, and more",
    count: 6,
    iconClass: "text-violet-600",
    firstArticle: "AI Chatbot Setup",
  },
  {
    icon: Wrench,
    title: "Troubleshooting",
    subtitle: "Common issues and how to fix them",
    count: 5,
    iconClass: "text-violet-600",
    firstArticle: "Troubleshooting",
  },
  {
    icon: FileText,
    title: "Plans & Policies",
    subtitle: "Lite vs Pro, bans, and refunds",
    count: 5,
    iconClass: "text-violet-600",
    firstArticle: "Understanding Your License",
  },
];

const POPULAR_ARTICLES = [
  "Quick Start Guide",
  "Understanding myshopify.com domains",
  "License Activation Step-by-Step",
  "AI Chatbot Setup",
  "Colors & Branding Setup",
];

type ArticleData = { section: string; htmlContent: string };

export default function DocsPage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "getting-started": true,
    "license-domain": true,
    "theme-customization": false,
    "feature-guides": false,
  });
  const [search, setSearch] = useState("");
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const selectArticle = useCallback((title: string) => {
    setActiveArticle(title);
    setHelpful(null);
    setArticleData(null);
    setMobileSidebarOpen(false);
    const sec = SIDEBAR_NAV.find((s) => s.items.includes(title));
    if (sec) setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    setActiveArticle(null);
    setHelpful(null);
    setArticleData(null);
  }, []);

  useEffect(() => {
    if (!activeArticle) return;

    let isMounted = true;

    const loadArticle = async () => {
      setIsArticleLoading(true);
      try {
        const response = await fetch(
          `/api/docs/article?title=${encodeURIComponent(activeArticle)}`,
        );

        if (!response.ok) {
          if (isMounted) {
            setArticleData(null);
          }
          return;
        }

        const data = (await response.json()) as ArticleData | null;
        if (isMounted) {
          setArticleData(data);
        }
      } catch {
        if (isMounted) {
          setArticleData(null);
        }
      } finally {
        if (isMounted) {
          setIsArticleLoading(false);
        }
      }
    };

    void loadArticle();

    return () => {
      isMounted = false;
    };
  }, [activeArticle]);

  // Sidebar search filter
  const filteredNav = search.trim()
    ? SIDEBAR_NAV.map((sec) => ({
        ...sec,
        items: sec.items.filter((item) =>
          item.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((sec) => sec.items.length > 0)
    : SIDEBAR_NAV;

  // Prev / Next navigation
  const flatArticles = SIDEBAR_NAV.flatMap((s) => s.items);
  const currentIdx = activeArticle ? flatArticles.indexOf(activeArticle) : -1;
  const prevArticle = currentIdx > 0 ? flatArticles[currentIdx - 1] : null;
  const nextArticle =
    currentIdx < flatArticles.length - 1 ? flatArticles[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top nav ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-1.5 -ml-1 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open article menu"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <Link
          href="/theme"
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#3a0ca3] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Vexel</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <button
            onClick={goHome}
            className="flex items-center gap-2 text-base font-semibold text-slate-900 hover:text-[#3a0ca3] transition-colors"
          >
            <BookOpen className="h-5 w-5 text-[#3a0ca3]" />
            <span className="hidden sm:inline">Vexel Docs</span>
            <span className="sm:hidden">Docs</span>
          </button>
        </div>
        <button
          onClick={() => router.push("")}
          className="text-sm font-medium text-[#3a0ca3] hover:underline hidden sm:block"
        >
          Need Help?
        </button>
      </nav>

      <div className="flex flex-1">
        {/* ── Mobile sidebar drawer ──────────────────────────────────────────── */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Documentation</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30"
                  />
                </div>
              </div>
              <nav className="flex-1 p-2 overflow-y-auto">
                {filteredNav.length === 0 && (
                  <p className="px-3 py-4 text-xs text-slate-400 text-center">No results</p>
                )}
                {filteredNav.map((sec) => (
                  <div key={sec.id} className="mb-1">
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <span>{sec.section}</span>
                      {openSections[sec.id] ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                    {(openSections[sec.id] || search.trim() !== "") && (
                      <ul className="mt-0.5 ml-2 space-y-0.5">
                        {sec.items.map((item) => (
                          <li key={item}>
                            <button
                              onClick={() => selectArticle(item)}
                              className={`w-full text-left pl-3 pr-2 py-1.5 text-xs rounded-md transition-colors ${
                                activeArticle === item
                                  ? "text-[#3a0ca3] bg-[#3a0ca3]/5 font-semibold"
                                  : "text-slate-500 hover:text-[#3a0ca3] hover:bg-slate-50"
                              }`}
                            >
                              {search.trim() ? (
                                <HighlightedText text={item} query={search} />
                              ) : (
                                item
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-[190px] shrink-0 border-r border-slate-200 bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30"
              />
            </div>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 p-2">
            {filteredNav.length === 0 && (
              <p className="px-3 py-4 text-xs text-slate-400 text-center">
                No results
              </p>
            )}
            {filteredNav.map((sec) => (
              <div key={sec.id} className="mb-1">
                <button
                  onClick={() => toggleSection(sec.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <span>{sec.section}</span>
                  {openSections[sec.id] ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
                {(openSections[sec.id] || search.trim() !== "") && (
                  <ul className="mt-0.5 ml-2 space-y-0.5">
                    {sec.items.map((item) => (
                      <li key={item}>
                        <button
                          onClick={() => selectArticle(item)}
                          className={`w-full text-left pl-3 pr-2 py-1 text-xs rounded-md transition-colors truncate ${
                            activeArticle === item
                              ? "text-[#3a0ca3] bg-[#3a0ca3]/5 font-semibold"
                              : "text-slate-500 hover:text-[#3a0ca3] hover:bg-slate-50"
                          }`}
                        >
                          {search.trim() ? (
                            <HighlightedText text={item} query={search} />
                          ) : (
                            item
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────────── */}
        <main className="flex-1 px-6 py-8 sm:px-10 sm:py-10 max-w-[900px] mx-auto">
          {activeArticle && articleData ? (
            /* ─── Article view ─── */
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 flex-wrap">
                <button
                  onClick={goHome}
                  className="hover:text-[#3a0ca3] transition-colors"
                >
                  Docs
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-500">{articleData.section}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-700 font-medium">
                  {activeArticle}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
                {activeArticle}
              </h1>

              {/* Content */}
              <div
                className="text-slate-600 text-sm leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mb-2"
                dangerouslySetInnerHTML={{ __html: articleData.htmlContent }}
              />

              {/* Was this helpful? */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Was this article helpful?
                </p>
                {helpful === null ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHelpful(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Yes, helpful
                    </button>
                    <button
                      onClick={() => setHelpful(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-red-400 hover:text-red-500 transition-colors"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" /> Not really
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {helpful
                      ? "Thanks for the feedback!"
                      : "Sorry to hear that. Contact support and we'll help you out."}
                  </p>
                )}
              </div>

              {/* Prev / Next */}
              <div className="mt-8 flex justify-between gap-4">
                {prevArticle ? (
                  <button
                    onClick={() => selectArticle(prevArticle)}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#3a0ca3] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{prevArticle}</span>
                  </button>
                ) : (
                  <div />
                )}
                {nextArticle ? (
                  <button
                    onClick={() => selectArticle(nextArticle)}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#3a0ca3] transition-colors"
                  >
                    <span>{nextArticle}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ) : activeArticle && isArticleLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading article...
            </div>
          ) : activeArticle && articleData === null ? (
            <div className="py-12 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Article not found
              </h2>
            </div>
          ) : (
            /* ─── Home view ─── */
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3a0ca3]/10 text-[#3a0ca3] mb-4">
                  <BookOpen className="h-3.5 w-3.5" />
                  Documentation
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                  Vexel Theme Documentation
                </h1>
                <p className="text-slate-500 text-base leading-relaxed max-w-xl mx-auto">
                  Everything you need to set up, customize, and get the most out
                  of your Vexel theme.
                </p>
              </div>

              {/* CTA banner */}
              <div
                className="rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #3730d4 0%, #4f46e5 100%)",
                }}
              >
                <div className="relative z-10">
                  <p className="text-white font-semibold text-lg mb-1">
                    New to Vexel?
                  </p>
                  <p className="text-indigo-200 text-sm">
                    Follow our quick start guide to get your store live in 15
                    minutes.
                  </p>
                </div>
                <button
                  onClick={() => selectArticle("Quick Start Guide")}
                  className="shrink-0 inline-flex items-center gap-2 bg-white text-[#3730d4] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors relative z-10"
                >
                  Quick Start
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -right-2 top-6 w-16 h-16 rounded-full bg-white/5" />
              </div>

              {/* Category cards 2×3 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.title}
                      onClick={() => selectArticle(cat.firstArticle)}
                      className="group text-left p-5 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#3a0ca3]/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2.5 rounded-xl ${cat.iconClass} shrink-0`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-0.5">
                            {cat.title}
                          </p>
                          <p className="text-xs text-slate-500 leading-snug mb-2">
                            {cat.subtitle}
                          </p>
                          <p className="text-xs text-slate-400">
                            {cat.count} articles
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#3a0ca3] transition-colors mt-1 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Popular Articles */}
              <div className="mb-10">
                <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">
                  Popular Articles
                </h2>
                <div className="rounded-xl border border-[#e2e8f0] bg-white divide-y divide-slate-100">
                  {POPULAR_ARTICLES.map((article) => (
                    <button
                      key={article}
                      onClick={() => selectArticle(article)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <span className="text-sm text-slate-700 group-hover:text-[#3a0ca3] transition-colors">
                        {article}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#3a0ca3] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dark card */}
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                    <span className="text-white text-base">■</span>
                  </div>
                  <p className="text-white font-semibold mb-1">Need Support?</p>
                  <p className="text-slate-400 text-sm mb-4">
                    Can&apos;t find what you&apos;re looking for? Our team is
                    here to help.
                  </p>
                  <button
                    onClick={() => router.push("/theme/support")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
                  >
                    Contact Us
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Light card */}
                <div className="rounded-2xl p-6 border border-[#e2e8f0] bg-white">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                    <span className="text-slate-600 text-base font-bold">
                      ?
                    </span>
                  </div>
                  <p className="text-slate-900 font-semibold mb-1">
                    Can&apos;t Find What You Need?
                  </p>
                  <p className="text-slate-500 text-sm mb-4">
                    Browse all our documentation options or search the
                    community.
                  </p>
                  <button
                    onClick={goHome}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#3a0ca3] bg-[#3a0ca3]/10 hover:bg-[#3a0ca3]/20 px-4 py-2 rounded-xl transition-colors"
                  >
                    View All Options
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function HighlightedText({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-slate-900 rounded-sm">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
