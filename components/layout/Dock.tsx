"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  LayoutDashboard, PenSquare, Flame, Bot, Zap, Settings,
  MoreHorizontal, BookOpen, Brain, Flag, Clock, GitBranch,
  TrendingUp, FolderGit2, Code2, Timer, Eye, Activity,
  Dumbbell, Weight, Moon, Mic, Volume2, BarChart3,
  FileText, Calendar, Search, Sparkles,
  GripVertical, RotateCw,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { ROUTES } from "@/lib/routes"
import { useMediaQuery } from "@/lib/use-media-query"

type NavOrientation = "horizontal" | "vertical"

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
  { label: "Dashboard", items: [
    { href: ROUTES.STUDY, label: "Overview", icon: LayoutDashboard },
    { href: ROUTES.STUDY_STATS, label: "Stats", icon: BarChart3 },
  ]},
  { label: "Tasks", items: [
    { href: ROUTES.STUDY_TASKS, label: "Tasks", icon: Timer },
    { href: ROUTES.STUDY_EXAMS, label: "Exams", icon: Calendar },
  ]},
  { label: "Resources", items: [
    { href: ROUTES.STUDY_FILES, label: "Files", icon: FileText },
    { href: ROUTES.STUDY_SOUNDS, label: "Sounds", icon: Volume2 },
  ]},
  { label: "Tools", items: [
    { href: ROUTES.STUDY_COMMUTE, label: "Commute", icon: Clock },
  ]},
]

const DOCK_PRIMARY: NavItem[] = [
  { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.HABITS, label: "Habits", icon: Flame },
  { href: ROUTES.ODYSSEY, label: "JARVIS", icon: Bot },
  { href: ROUTES.FOCUS, label: "Focus", icon: Zap },
]

const LS_ORIENTATION = "lifeos-navbar-orientation"
const LS_SIZE = "lifeos-navbar-size"

function storeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function storeSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function Dock() {
  const pathname = usePathname()
  const { mode, setCommandPalette, setMode, navPosition, setNavPosition } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isMobile = useMediaQuery("(max-width: 639px)")

  // Orientation + sizing state (persisted)
  const [orientation, setOrientationState] = useState<NavOrientation>(
    () => storeGet(LS_ORIENTATION, "horizontal")
  )
  const [navSize, setNavSizeState] = useState<number>(
    () => storeGet(LS_SIZE, 0)
  )

  const setOrientation = useCallback((o: NavOrientation) => {
    setOrientationState(o)
    storeSet(LS_ORIENTATION, o)
  }, [])

  const setNavSize = useCallback((s: number) => {
    setNavSizeState(s)
    storeSet(LS_SIZE, s)
  }, [])

  // Resize tracking
  const isResizing = useRef(false)
  const resizeStart = useRef({ x: 0, y: 0, size: 0 })

  // Responsive default position: bottom-center on first load
  useEffect(() => {
    if (navPosition.x === 0 && navPosition.y === 0) {
      const vw = window.innerWidth
      const vh = window.innerHeight
      setNavPosition({ x: vw / 2, y: vh - 100 })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-clamp on resize
  useEffect(() => {
    const handle = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const barW = barRef.current?.offsetWidth || 400
      const barH = barRef.current?.offsetHeight || 72
      setNavPosition({
        x: Math.max(barW / 2, Math.min(vw - barW / 2, navPosition.x)),
        y: Math.max(barH / 2, Math.min(vh - barH / 2, navPosition.y)),
      })
    }
    window.addEventListener("resize", handle)
    return () => window.removeEventListener("resize", handle)
  }, [navPosition, setNavPosition])

  // Clamp function for drag
  const clamp = useCallback((x: number, y: number) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const barW = barRef.current?.offsetWidth || 400
    const barH = barRef.current?.offsetHeight || 72
    return {
      x: Math.max(barW / 2, Math.min(vw - barW / 2, x)),
      y: Math.max(barH / 2 + 8, Math.min(vh - barH / 2 - 8, y)),
    }
  }, [])

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

  // Resize pointer handlers
  const onResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isResizing.current = true
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      size: navSize || (orientation === "horizontal" ? 400 : 400),
    }
    document.addEventListener("pointermove", onResizeMove)
    document.addEventListener("pointerup", onResizeEnd)
  }, [navSize, orientation]) // eslint-disable-line react-hooks/exhaustive-deps

  const onResizeMove = useCallback((e: PointerEvent) => {
    if (!isResizing.current) return
    if (orientation === "horizontal") {
      const delta = e.clientX - resizeStart.current.x
      const newSize = Math.max(280, Math.min(window.innerWidth * 0.9, resizeStart.current.size + delta * 2))
      setNavSize(newSize)
    } else {
      const delta = e.clientY - resizeStart.current.y
      const newSize = Math.max(320, Math.min(window.innerHeight * 0.8, resizeStart.current.size + delta))
      setNavSize(newSize)
    }
  }, [orientation, setNavSize])

  const onResizeEnd = useCallback(() => {
    isResizing.current = false
    document.removeEventListener("pointermove", onResizeMove)
    document.removeEventListener("pointerup", onResizeEnd)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile: render fixed bottom-center bar, no drag/toggle
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-3 py-2 h-[88px] glass-strong border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
        <Link href={ROUTES.HOME} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-colors", pathname === ROUTES.HOME ? "text-brand-400" : "text-text-tertiary")}>
          <LayoutDashboard className="w-5 h-5" /><span className="text-[11px] font-medium">Home</span>
        </Link>
        <Link href={ROUTES.JOURNAL} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-colors", pathname === ROUTES.JOURNAL ? "text-brand-400" : "text-text-tertiary")}>
          <PenSquare className="w-5 h-5" /><span className="text-[11px] font-medium">Journal</span>
        </Link>
        <Link href={ROUTES.HABITS} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-colors", pathname === ROUTES.HABITS ? "text-brand-400" : "text-text-tertiary")}>
          <Flame className="w-5 h-5" /><span className="text-[11px] font-medium">Habits</span>
        </Link>
        <Link href={ROUTES.ODYSSEY} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-colors", pathname === ROUTES.ODYSSEY ? "text-brand-400" : "text-text-tertiary")}>
          <Bot className="w-5 h-5" /><span className="text-[11px] font-medium">JARVIS</span>
        </Link>
        <Link href={ROUTES.FOCUS} className={cn("flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition-colors", pathname === ROUTES.FOCUS ? "text-brand-400" : "text-text-tertiary")}>
          <Zap className="w-5 h-5" /><span className="text-[11px] font-medium">Focus</span>
        </Link>
      </nav>
    )
  }

  const sections = mode === "study" ? studySections : workSections
  const isHorizontal = orientation === "horizontal"

  return (
    <div ref={dockRef} className="fixed z-50 select-none" style={{ left: navPosition.x, top: navPosition.y, transform: "translate(-50%, -50%)" }}>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "glass-elevated rounded-2xl p-4 max-h-[55vh] overflow-y-auto",
              isHorizontal
                ? "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 min-w-[300px] sm:min-w-[360px] max-w-[420px]"
                : "absolute right-full mr-3 top-1/2 -translate-y-1/2 min-w-[260px] max-w-[320px]"
            )}
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
                      <Link key={item.href} href={item.href} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all interactive-scale", active ? "text-white bg-brand-500/10 border border-brand-500/20" : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]")}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={barRef}
        drag
        dragMomentum={false}
        onDrag={(_, info) => {
          const clamped = clamp(navPosition.x + info.delta.x, navPosition.y + info.delta.y)
          setNavPosition(clamped)
        }}
        onDragStart={() => setExpanded(false)}
        dragElastic={0}
        className={cn(
          "glass-elevated shadow-2xl border border-white/[0.06] transition-[border-radius] duration-200",
          isHorizontal
            ? "flex items-center px-2 py-2 min-h-[72px]"
            : "flex flex-col items-center py-3 px-2 min-w-[120px]"
        )}
        style={{
          width: isHorizontal ? (navSize ? `${navSize}px` : "auto") : "auto",
          height: isHorizontal ? "auto" : (navSize ? `${navSize}px` : "auto"),
          borderRadius: 16,
          cursor: "grab",
        }}
        whileDrag={{ opacity: 0.85, scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
      >
        {/* Drag handle */}
        <div className={cn(
          "flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors",
          isHorizontal ? "mr-1" : "mb-1"
        )}>
          <GripVertical className={cn("w-4 h-4", isHorizontal ? "" : "rotate-90")} />
        </div>

        {/* Search */}
        <button
          onClick={() => setCommandPalette(true)}
          className={cn(
            "flex items-center justify-center rounded-xl text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06] transition-all btn-micro",
            isHorizontal ? "h-10 w-10" : "h-10 w-10 mb-1"
          )}
          title="Search (⌘K)"
        >
          <Search className="w-[22px] h-[22px]" />
        </button>

        <div className={cn(
          "bg-white/[0.06]",
          isHorizontal ? "w-px h-8 mx-1" : "h-px w-8 my-1"
        )} />

        {/* Primary nav items */}
        {DOCK_PRIMARY.map((item, idx) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center rounded-xl transition-colors",
                isHorizontal
                  ? "flex-col justify-center gap-1 px-3 py-2 min-w-[60px]"
                  : "flex-row justify-start gap-3 px-3 py-2.5 w-full"
              )}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <motion.div
                className={cn(
                  "flex items-center justify-center transition-colors rounded-xl",
                  isHorizontal ? "h-10 w-10" : "h-9 w-9 shrink-0",
                  active
                    ? isHorizontal ? "text-brand-400" : "text-brand-400 bg-brand-500/10"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <Icon className="w-[22px] h-[22px]" />
              </motion.div>
              <span className={cn(
                "font-medium leading-tight text-center",
                isHorizontal ? "text-[12px]" : "text-[13px]",
                active ? "text-brand-400" : "text-text-tertiary"
              )}>
                {item.label}
              </span>
              {active && isHorizontal && (
                <motion.div layoutId="dock-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              )}
              {active && !isHorizontal && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-brand-400" />
              )}
            </Link>
          )
        })}

        <div className={cn(
          "bg-white/[0.06]",
          isHorizontal ? "w-px h-8 mx-1" : "h-px w-8 my-1"
        )} />

        {/* All sections expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center justify-center rounded-xl transition-all btn-micro",
            isHorizontal ? "h-10 w-10" : "h-10 w-10 mb-1",
            expanded ? "text-brand-400 bg-brand-500/10" : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06]"
          )}
          title="All sections"
        >
          <MoreHorizontal className="w-[22px] h-[22px]" />
        </button>

        <div className={cn(
          "bg-white/[0.06]",
          isHorizontal ? "w-px h-8 mx-1" : "h-px w-8 my-1"
        )} />

        {/* Settings */}
        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            "flex items-center justify-center rounded-xl transition-all btn-micro",
            isHorizontal ? "h-10 w-10" : "h-10 w-10 mb-1",
            pathname === ROUTES.SETTINGS ? "text-brand-400" : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06]"
          )}
          title="Settings"
        >
          <Settings className="w-[22px] h-[22px]" />
        </Link>

        {/* Orientation toggle */}
        <button
          onClick={() => setOrientation(isHorizontal ? "vertical" : "horizontal")}
          className={cn(
            "flex items-center justify-center rounded-xl transition-all btn-micro text-text-muted hover:text-text-secondary hover:bg-white/[0.06]",
            isHorizontal ? "h-10 w-10 ml-1" : "h-10 w-10 mt-1"
          )}
          title={`Switch to ${isHorizontal ? "vertical" : "horizontal"}`}
        >
          <RotateCw className="w-[16px] h-[16px]" />
        </button>

        {/* Resize handle */}
        <div
          className={cn(
            "absolute z-10 flex items-center justify-center text-text-muted opacity-40 hover:opacity-100 transition-opacity cursor-ew-resize",
            isHorizontal
              ? "right-0 top-0 bottom-0 w-4"
              : "left-0 right-0 bottom-0 h-4 cursor-ns-resize"
          )}
          style={{ touchAction: "none" }}
          onPointerDown={onResizeStart}
        >
          <div className={cn(
            "bg-white/20 rounded-full",
            isHorizontal ? "w-1 h-8" : "h-1 w-8"
          )} />
        </div>
      </motion.div>
    </div>
  )
}
