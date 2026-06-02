"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, LayoutDashboard, Activity, Dumbbell, Weight, Sparkles, X, TrendingUp, Bot, Moon, BookOpen, Target, Zap, Plus, Timer, Brain, Flame, PenSquare, GitBranch, Flag, TrendingUp as ForecastIcon, Clock, Mic, BarChart3, GitFork, Eye, FileText, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const commands = [
  { id: "go-home", label: "Go to Home", icon: LayoutDashboard, href: "/" },
  { id: "go-stocks", label: "Go to Stocks", icon: TrendingUp, href: "/stocks" },
  { id: "go-jarvis", label: "Open JARVIS", icon: Bot, href: "/odyssey" },
  { id: "go-health", label: "Go to Health", icon: Activity, href: "/health" },
  { id: "go-gym", label: "Go to Gym", icon: Dumbbell, href: "/gym" },
  { id: "go-weight", label: "Go to Weight", icon: Weight, href: "/weight" },
  { id: "go-sleep", label: "Go to Sleep", icon: Moon, href: "/sleep" },
  { id: "go-study", label: "Go to Study", icon: BookOpen, href: "/study" },
  { id: "go-projects", label: "Go to Projects", icon: Target, href: "/projects" },
  { id: "go-journal", label: "Go to Journal", icon: PenSquare, href: "/journal" },
  { id: "go-learning", label: "Go to Learning OS", icon: Brain, href: "/learning" },
  { id: "go-missions", label: "Go to Missions", icon: Flag, href: "/missions" },
  { id: "go-decisions", label: "Go to Decisions", icon: GitBranch, href: "/decisions" },
  { id: "go-reviews", label: "Go to Reviews", icon: ForecastIcon, href: "/reviews" },
  { id: "go-brain", label: "Go to Second Brain", icon: Brain, href: "/brain" },
  { id: "go-timeline", label: "Go to Timeline", icon: Clock, href: "/timeline" },
  { id: "go-habits", label: "Go to Habits", icon: Flame, href: "/habits" },
  { id: "go-voice", label: "Go to Voice", icon: Mic, href: "/voice" },
  { id: "go-briefings", label: "Go to Briefings", icon: BarChart3, href: "/briefings" },
  { id: "go-memory", label: "Go to Memory Engine", icon: Search, href: "/memory" },
  { id: "go-correlations", label: "Go to Patterns & Correlations", icon: GitFork, href: "/correlations" },
  { id: "go-future", label: "Go to Future Self", icon: Eye, href: "/future" },
  { id: "go-report", label: "Go to Life Report", icon: FileText, href: "/report" },
  { id: "ai-summary", label: "Ask JARVIS", icon: Sparkles, action: "ai-summary" },
  { id: "add-goal", label: "Add Goal", icon: Plus, action: "add-goal" },
  { id: "focus-mode", label: "Start Focus Session", icon: Timer, action: "focus" },
  { id: "log-workout", label: "Log Workout", icon: Dumbbell, href: "/gym" },
  { id: "add-habit", label: "Add Habit", icon: Flame, action: "add-habit" },
  { id: "journal", label: "Write Journal Entry", icon: PenSquare, action: "journal" },
  { id: "generate-study-plan", label: "Generate Study Plan", icon: BookOpen, action: "study-plan", href: "/reviews" },
  { id: "generate-workout-routine", label: "Generate Workout Routine", icon: Dumbbell, action: "workout-routine", href: "/reviews" },
  { id: "create-daily-schedule", label: "Create Daily Schedule", icon: Calendar, action: "daily-schedule", href: "/reviews" },
  { id: "run-weekly-review", label: "Run Weekly Review", icon: ForecastIcon, action: "weekly-review", href: "/reviews" },
  { id: "recommend-priorities", label: "Recommend Priorities", icon: Target, action: "priorities", href: "/reviews" },
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
    else if (command.action === "add-goal") router.push("/")
    else if (command.action === "focus") router.push("/")
    else if (command.action === "add-habit") router.push("/")
    else if (command.action === "journal") router.push("/journal")
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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setCommandPalette(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.60)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
                onKeyDown={handleKey}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <kbd className="kbd">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-8 text-white/30 gap-2">
                  <Brain className="w-8 h-8 text-white/10" />
                  <p className="text-xs">No commands found for &quot;{query}&quot;</p>
                </div>
              )}
              {filtered.map((cmd, idx) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                      idx === selectedIdx ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    {"href" in cmd && cmd.href && (
                      <span className="text-[10px] text-white/20 font-mono">Navigate</span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
