"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Search, Command, Menu, X, Github, Palette, Target } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { NotificationPanel } from "./NotificationPanel"
import { ModeToggle } from "./ModeToggle"
import { ThemePanel } from "./ThemePanel"
import { FocusOverlay, useFocusOverlay } from "@/components/life/FocusOverlay"

export function TopNav() {
  const { setCommandPalette, setAIPanel, aiPanelOpen, mobileMenuOpen, setMobileMenu, mode } = useStore()
  const focus = useFocusOverlay()
  const [dateStr, setDateStr] = useState("")
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase())
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    if (themeOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [themeOpen])

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 md:px-6 glass-sm rounded-none border-b-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenu(!mobileMenuOpen)}
          className="lg:hidden h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-text-tertiary hover:bg-white/[0.08] hover:text-text-secondary transition-colors"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <Link href="/" className="text-sm font-bold text-gradient hidden sm:block mr-2">LifeOS</Link>
        <span className="text-xs text-text-tertiary font-mono">{dateStr}</span>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <button onClick={() => focus.open()}
          className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary hover:bg-white/10 transition-all active:scale-95"
        >
          <Target className="w-3.5 h-3.5" />
          Focus
        </button>
        <FocusOverlay show={focus.show} onClose={focus.close} />

        <button
          onClick={() => setCommandPalette(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-tertiary text-xs hover:bg-white/[0.08] hover:text-text-secondary hover:scale-105 active:scale-95 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <div className="hidden sm:flex items-center gap-0.5">
            <kbd className="kbd text-[11px]">⌘</kbd>
            <kbd className="kbd text-[11px]">K</kbd>
          </div>
        </button>

        <button
          onClick={() => setAIPanel(!aiPanelOpen)}
          className="h-9 w-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Command className="w-4 h-4" />
        </button>

        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-text-tertiary hover:bg-white/[0.08] hover:text-text-secondary hover:scale-105 active:scale-95 transition-all"
          >
            <Palette className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {themeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-full mt-2"
              >
                <ThemePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NotificationPanel />
      </div>
    </header>
  )
}
