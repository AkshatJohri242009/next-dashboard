"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  LayoutDashboard, PenSquare, Flame, Bot, Zap, Settings,
  MoreHorizontal, BookOpen, Brain, Flag, Clock, GitBranch,
  TrendingUp, FolderGit2, Code2, Timer, Eye, Activity,
  Dumbbell, Weight, Moon, Mic, Volume2, BarChart3,
  FileText, Calendar, Search, Sparkles,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { useMediaQuery } from "@/lib/use-media-query"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface NavSection {
  label: string
  items: NavItem[]
}

const workSections: NavSection[] = [
  {
    label: "Core",
    items: [
      { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
      { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
      { href: ROUTES.FOCUS, label: "Focus", icon: Zap },
    ],
  },
  {
    label: "Life OS",
    items: [
      { href: ROUTES.HABITS, label: "Habits", icon: Flame },
      { href: ROUTES.LEARNING, label: "Learning", icon: Brain },
      { href: ROUTES.MISSIONS, label: "Missions", icon: Flag },
      { href: ROUTES.TIMELINE, label: "Timeline", icon: Clock },
      { href: ROUTES.DECISIONS, label: "Decisions", icon: GitBranch },
      { href: ROUTES.REVIEWS, label: "Reviews", icon: TrendingUp },
    ],
  },
  {
    label: "Health",
    items: [
      { href: ROUTES.HEALTH, label: "Health", icon: Activity },
      { href: ROUTES.GYM, label: "Gym", icon: Dumbbell },
      { href: ROUTES.WEIGHT, label: "Weight", icon: Weight },
      { href: ROUTES.SLEEP, label: "Sleep", icon: Moon },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: ROUTES.ODYSSEY, label: "JARVIS", icon: Bot },
      { href: ROUTES.VOICE, label: "Voice", icon: Mic },
      { href: ROUTES.BRIEFINGS, label: "Briefings", icon: Volume2 },
      { href: ROUTES.BRAIN, label: "Brain", icon: Sparkles },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: ROUTES.MEMORY, label: "Memory", icon: Brain },
      { href: ROUTES.CORRELATIONS, label: "Patterns", icon: GitBranch },
      { href: ROUTES.FUTURE, label: "Future", icon: Eye },
      { href: ROUTES.REPORT, label: "Report", icon: BookOpen },
    ],
  },
  {
    label: "Data",
    items: [
      { href: ROUTES.STOCKS, label: "Stocks", icon: TrendingUp },
      { href: ROUTES.PROJECTS, label: "Projects", icon: FolderGit2 },
      { href: ROUTES.OPENCODE, label: "OpenCode", icon: Code2 },
      { href: ROUTES.TIMER, label: "Timer", icon: Timer },
    ],
  },
  {
    label: "System",
    items: [
      { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
      { href: ROUTES.POMODORO, label: "Pomodoro", icon: Timer },
    ],
  },
]

const studySections: NavSection[] = [
  {
    label: "Dashboard",
    items: [
      { href: ROUTES.STUDY, label: "Overview", icon: LayoutDashboard },
      { href: ROUTES.STUDY_STATS, label: "Stats", icon: BarChart3 },
    ],
  },
  {
    label: "Tasks",
    items: [
      { href: ROUTES.STUDY_TASKS, label: "Tasks", icon: Timer },
      { href: ROUTES.STUDY_EXAMS, label: "Exams", icon: Calendar },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: ROUTES.STUDY_FILES, label: "Files", icon: FileText },
      { href: ROUTES.STUDY_SOUNDS, label: "Sounds", icon: Volume2 },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: ROUTES.STUDY_COMMUTE, label: "Commute", icon: Clock },
    ],
  },
]

const DOCK_PRIMARY: NavItem[] = [
  { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.HABITS, label: "Habits", icon: Flame },
  { href: ROUTES.ODYSSEY, label: "JARVIS", icon: Bot },
  { href: ROUTES.FOCUS, label: "Focus", icon: Zap },
]

export function Dock() {
  const pathname = usePathname()
  const { mode, setCommandPalette, setMode } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    if (expanded) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [expanded])

  useEffect(() => { setExpanded(false) }, [pathname])

  const sections = mode === "study" ? studySections : workSections

  return (
    <div ref={dockRef} className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 select-none">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 glass-elevated rounded-2xl p-4 max-h-[55vh] overflow-y-auto min-w-[300px] sm:min-w-[360px] max-w-[420px]"
          >
            {sections.map((section) => (
              <div key={section.label} className="mb-4 last:mb-0">
                <p className="text-[11px] font-bold tracking-widest text-text-muted uppercase mb-2 px-1">
                  {section.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all interactive-scale",
                          active
                            ? "text-white bg-brand-500/10 border border-brand-500/20"
                            : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]",
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-0.5 px-1.5 h-14 glass-elevated rounded-2xl shadow-2xl border border-white/[0.06]">
        <button
          onClick={() => setCommandPalette(true)}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06] transition-all btn-micro"
          title="Search (⌘K)"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        {DOCK_PRIMARY.map((item, idx) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <motion.div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-colors",
                  active
                    ? "text-brand-400"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <Icon className="w-[22px] h-[22px]" />
              </motion.div>
              <AnimatePresence>
                {hoveredIdx === idx && !isDesktop && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-[#1C1C1E]/90 backdrop-blur-md text-[11px] font-medium text-white whitespace-nowrap border border-white/[0.06] pointer-events-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  layoutId="dock-active"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              {isDesktop && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-text-muted whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center transition-all btn-micro",
            expanded
              ? "text-brand-400 bg-brand-500/10"
              : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06]",
          )}
          title="All sections"
        >
          <MoreHorizontal className="w-[18px] h-[18px]" />
        </button>

        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center transition-all btn-micro",
            pathname === ROUTES.SETTINGS
              ? "text-brand-400"
              : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06]",
          )}
          title="Settings"
        >
          <Settings className="w-[18px] h-[18px]" />
        </Link>
      </div>
    </div>
  )
}
