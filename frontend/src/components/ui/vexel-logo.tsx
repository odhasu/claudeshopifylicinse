"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function VexelLogo() {
  const pathname = usePathname()
  // Hide on docs page (handle basePath + trailing slash)
  const isDocsPage = /\/theme\/docs\/?$/.test(pathname)
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isCheckout = pathname.startsWith('/theme/checkout')
  if (isDocsPage || isAdminPage || isCheckout) return null
  return (
    <Link
      href="/"
      className="fixed top-4 left-5 z-50 flex items-center gap-2 select-none"
    >
      <img
        src="/diamond-logo.svg"
        alt="Vexel Logo"
        className="w-7 h-7 brightness-0"
      />
      <span className="text-base font-extrabold text-slate-900 tracking-tight">Vexel</span>
    </Link>
  )
}
