"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function VexelLogo() {
  const pathname = usePathname()
  // Hide on docs page (handle basePath + trailing slash)
  const isDocsPage = /\/theme\/docs\/?$/.test(pathname)
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  if (isDocsPage || isAdminPage) return null
  return (
    <Link
      href="/"
      className="fixed top-4 left-5 z-50 flex items-center gap-2 select-none"
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#3a0ca3] p-1.5 shadow-sm">
        <img
          src="/diamond-logo.svg"
          alt="Vexel Logo"
          className="w-full h-full brightness-0 invert"
        />
      </div>
      <span className="text-sm font-bold text-slate-900 tracking-tight">Vexel</span>
    </Link>
  )
}
