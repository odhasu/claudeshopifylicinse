"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CreditCard, BookOpen, MessageCircle, User } from "lucide-react"

const BASE_NAV_ITEMS = [
  { name: "Home",    url: "/theme",          icon: Home },
  { name: "Pricing", url: "/theme/pricing",  icon: CreditCard },
  { name: "Docs",    url: "/theme/docs",     icon: BookOpen },
  { name: "Support", url: "/theme/support",  icon: MessageCircle },
  { name: "Account", url: "/theme/account",  icon: User },
]

interface NavBarProps {
  className?: string
}

export function NavBar({ className }: NavBarProps) {
  const pathname = usePathname()
  const NAV_ITEMS = BASE_NAV_ITEMS

  // Find active tab matching URL at end of pathname (ignoring trailing slash)
  const activeTab = NAV_ITEMS.find((item) => {
    const urlPattern = new RegExp(`${item.url}/?$`)
    return urlPattern.test(pathname)
  })?.name ?? NAV_ITEMS[0].name

  return (
    <>
      {/* Unified pill-style navigation bar */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none",
          "bottom-4 sm:bottom-auto sm:top-0 sm:pt-10",
          className,
        )}
      >
        {/* Desktop: full bar — Mobile: compact bottom bar without logo & CTA */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
          {/* Logo — desktop only */}
          <Link
            href="/"
            className="flex items-center gap-1 pl-2 pr-0 sm:pr-2 py-1 rounded-full select-none shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
              <img
                src="/diamond-logo.svg"
                alt="Vexel Logo"
                className="w-full h-full"
              />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight hidden sm:inline">Vexel</span>
          </Link>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.name
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.url}
                className={cn(
                  "relative cursor-pointer font-semibold rounded-full transition-colors",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary",
                  "flex flex-col sm:flex-row items-center justify-center",
                  "px-3 py-2 sm:px-6 sm:py-2",
                )}
                title={item.name}
              >
                <Icon className="w-5 h-5 sm:hidden" strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden sm:inline text-sm">{item.name}</span>
                <AnimatePresence>
                {isActive && (
                  <motion.div
                    key={item.name}
                    className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full -bottom-2 sm:-top-2 sm:bottom-auto sm:rounded-t-full">
                      <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </Link>
            )
          })}
          {/* CTA button — desktop only */}
          <Link
            href="/theme/pricing"
            className="hidden sm:inline-flex items-center gap-1 cursor-pointer font-semibold rounded-full bg-foreground text-background hover:opacity-90 transition-opacity ml-1 shrink-0 text-sm px-5 py-2"
          >
            Get Started →
          </Link>
        </div>
      </div>

      {/* No spacer needed — mobile nav is at bottom */}
    </>
  )
}
