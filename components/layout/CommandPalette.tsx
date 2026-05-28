"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, LayoutDashboard, Activity, Dumbbell, Weight, Sparkles, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const commands = [
  { id: "go-home", label: "Go to Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "go-health", label: "Go to Health", icon: Activity, href: "/health" },
  { id: "go-gym", label: "Go to Gym", icon: Dumbbell, href: "/gym" },
  { id: "go-weight", label: "Go to Weight", icon: Weight, href: "/weight" },
  { id: "ai-summary", label: "Generate AI Summary", icon: Sparkles, action: "ai-summary" },
]

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPalette } = useStore()
  const [query, setQuery] = useState("")
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  const handleSelect = useCallback((command: typeof commands[0]) => {
    setCommandPalette(false)
    setQuery("")
    if ("href" in command && command.href) router.push(command.href)
    else if (command.action === "ai-summary") useStore.getState().setAIPanel(true)
  }, [router, setCommandPalette])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPalette(!commandPaletteOpen)
      }
      if (e.key === "Escape" && commandPaletteOpen) setCommandPalette(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [commandPaletteOpen, setCommandPalette])

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("")
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
    if (e.key === "Enter") { e.preventDefault(); filtered[selectedIdx] && handleSelect(filtered[selectedIdx]) }
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setCommandPalette(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg glass-strong rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-white/30" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
                onKeyDown={handleKey}
                placeholder="Search pages or run commands..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <kbd className="kbd">esc</kbd>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {filtered.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 h-10 rounded-xl text-sm transition-colors",
                    idx === selectedIdx ? "bg-brand-500/10 text-brand-300" : "text-white/60 hover:text-white/80 hover:bg-white/[0.04]",
                  )}
                >
                  <cmd.icon className="w-4 h-4" />
                  <span>{cmd.label}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center text-sm text-white/30">No results found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
