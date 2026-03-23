"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function VexelLogo() {
  const pathname = usePathname()
  // Hide on docs page (handle basePath + trailing slash)
  const isDocsPage = /\/theme\/docs\/?$/.test(pathname)
  if (isDocsPage) return null
  return (
    <Link
      href="/"
      className="fixed top-1 left-1 z-50 flex items-center gap-2 select-none"
    >
      <div className="w-20 h-20 flex items-center justify-center">
        <img 
          src="/diamond-logo.svg" 
          alt="Vexel Logo" 
          className="w-full h-full"
        />
      </div>
      <span className="text-sm font-bold text-slate-900 tracking-tight -ml-5">Vexel</span>
    </Link>
  )
}
