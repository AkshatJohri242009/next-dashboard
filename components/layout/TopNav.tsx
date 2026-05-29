"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Search, Command, Menu, X, Github, Palette } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { NotificationPanel } from "./NotificationPanel"
import { ModeToggle } from "./ModeToggle"
import { ThemePanel } from "./ThemePanel"

export function TopNav() {
  const { setCommandPalette, setAIPanel, aiPanelOpen, mobileMenuOpen, setMobileMenu, mode } = useStore()
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
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.06] bg-[#050506]/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenu(!mobileMenuOpen)}
          className="lg:hidden h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50 hover:bg-white/[0.08] hover:text-white/70 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        <span className="text-xs text-white/30 font-mono">{dateStr}</span>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCommandPalette(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs hover:bg-white/[0.08] hover:text-white/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <span className="hidden sm:flex items-center gap-1 ml-2">
            <kbd className="kbd">⌘</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </motion.button>

        {mode === "work" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAIPanel(!aiPanelOpen)}
            className="relative h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center hover:bg-brand-500/20 transition-colors"
          >
            <Command className="w-4 h-4 text-brand-400" />
          </motion.button>
        )}

        <div ref={themeRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setThemeOpen(!themeOpen)}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-colors"
          >
            <Palette className="w-4 h-4" />
          </motion.button>
          <AnimatePresence>
            {themeOpen && <ThemePanel />}
          </AnimatePresence>
        </div>

        <NotificationPanel />

        <motion.a
          href="https://github.com/AkshatJohri242009"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden"
        >
          <Github className="w-4 h-4 text-white/50" />
        </motion.a>
      </div>
    </header>
  )
}
