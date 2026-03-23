"use client"

import { useEffect, useRef, useState } from "react"

const START_VALUE = 2_810_825_243
const MIN_INCREMENT = 20
const MAX_INCREMENT = 100
const MIN_DELAY_MS = 1000
const MAX_DELAY_MS = 10_000
const INCREMENT_ANIMATION_MS = 600
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

function formatSalesCount(n: number) {
  return Math.floor(n).toLocaleString('en-US')
}

export function SalesBadge() {
  const [value, setValue] = useState(START_VALUE)
  const [mounted, setMounted] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  
  // Session tracking
  const sessionStartRef = useRef<number | null>(null)
  const sessionStartTimeRef = useRef<number | null>(null)
  
  // Increment animation refs
  const incrementAnimationStartRef = useRef<number | null>(null)
  const incrementAnimationStartValueRef = useRef(START_VALUE)
  const incrementAnimationTargetRef = useRef(START_VALUE)
  
  const phaseRef = useRef<'increment' | 'scheduled'>('scheduled')
  const initializedRef = useRef(false)

  const safeLocalStorage = {
    getItem(key: string): string | null {
      try { return localStorage.getItem(key) } catch { return null }
    },
    setItem(key: string, value: string): void {
      try { localStorage.setItem(key, value) } catch {}
    },
    removeItem(key: string): void {
      try { localStorage.removeItem(key) } catch {}
    },
  }

  const resetSession = () => {
    sessionStartRef.current = null
    sessionStartTimeRef.current = null
    incrementAnimationStartRef.current = null
    incrementAnimationStartValueRef.current = START_VALUE
    incrementAnimationTargetRef.current = START_VALUE
    phaseRef.current = 'scheduled'
    setValue(START_VALUE)
    safeLocalStorage.removeItem('salesBadgeSessionStart')
    safeLocalStorage.removeItem('salesBadgeValue')
  }

  // Hydration fix
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (initializedRef.current) return
    initializedRef.current = true

    const savedSessionStart = safeLocalStorage.getItem('salesBadgeSessionStart')
    const savedValue = safeLocalStorage.getItem('salesBadgeValue')

    if (savedSessionStart && savedValue) {
      const sessionStartTime = parseInt(savedSessionStart, 10)
      const now = Date.now()
      const sessionElapsed = now - sessionStartTime

      if (sessionElapsed < SESSION_DURATION_MS) {
        // Session still valid, restore the saved value
        const savedValueNumber = parseInt(savedValue, 10)
        setValue(savedValueNumber)
        sessionStartTimeRef.current = sessionStartTime
        incrementAnimationTargetRef.current = savedValueNumber
        incrementAnimationStartValueRef.current = savedValueNumber
        phaseRef.current = 'scheduled'
      } else {
        // 24 hours passed, reset everything
        safeLocalStorage.removeItem('salesBadgeSessionStart')
        safeLocalStorage.removeItem('salesBadgeValue')
        sessionStartTimeRef.current = Date.now()
        safeLocalStorage.setItem('salesBadgeSessionStart', sessionStartTimeRef.current.toString())
        setValue(START_VALUE)
      }
    } else {
      // First load, save the session start time
      const now = Date.now()
      sessionStartTimeRef.current = now
      safeLocalStorage.setItem('salesBadgeSessionStart', now.toString())
      setValue(START_VALUE)
    }
  }, [mounted])

  // Save value to localStorage whenever it changes (after mount)
  useEffect(() => {
    if (!mounted) return
    safeLocalStorage.setItem('salesBadgeValue', Math.floor(value).toString())
  }, [value, mounted])

  useEffect(() => {
    if (!mounted) return

    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS
      timeoutRef.current = window.setTimeout(() => {
        const increment = Math.floor(Math.random() * (MAX_INCREMENT - MIN_INCREMENT + 1)) + MIN_INCREMENT
        const currentTarget = incrementAnimationTargetRef.current
        incrementAnimationStartValueRef.current = currentTarget
        incrementAnimationTargetRef.current = currentTarget + increment
        incrementAnimationStartRef.current = null
        phaseRef.current = 'increment'
      }, delay)
    }

    const animate = (timestamp: number) => {
      if (sessionStartRef.current === null) {
        sessionStartRef.current = timestamp
      }

      // Check 24-hour limit using real-world time
      if (sessionStartTimeRef.current !== null) {
        const realWorldSessionElapsed = Date.now() - sessionStartTimeRef.current
        if (realWorldSessionElapsed >= SESSION_DURATION_MS) {
          resetSession()
          return
        }
      }

      if (phaseRef.current === 'increment') {
        if (incrementAnimationStartRef.current === null) {
          incrementAnimationStartRef.current = timestamp
        }

        const elapsed = timestamp - incrementAnimationStartRef.current
        const progress = Math.min(elapsed / INCREMENT_ANIMATION_MS, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        
        const startValue = incrementAnimationStartValueRef.current
        const target = incrementAnimationTargetRef.current
        const difference = target - startValue
        const nextValue = startValue + difference * eased

        setValue(nextValue)

        if (progress >= 1) {
          setValue(target)
          phaseRef.current = 'scheduled'
          scheduleNext()
        }
      }

      rafRef.current = window.requestAnimationFrame(animate)
    }

    rafRef.current = window.requestAnimationFrame(animate)
    
    // Schedule first increment immediately
    scheduleNext()

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [mounted])

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/5 border border-border backdrop-blur-lg shadow-lg">
      <span className="text-sm text-foreground font-medium">Theme Store Sales:</span>
      <span className="text-sm font-bold tabular-nums text-green-500">
        {formatSalesCount(value)}
      </span>
    </div>
  )
}
