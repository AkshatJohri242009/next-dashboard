"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import {
  LayoutDashboard, PenSquare, Flame, Bot, Zap, Settings,
  MoreHorizontal, BookOpen, Brain, Flag, Clock, GitBranch,
  TrendingUp, FolderGit2, Code2, Timer, Eye, Activity,
  Dumbbell, Weight, Moon, Mic, Volume2, BarChart3,
  FileText, Calendar, Search, Sparkles, Target,
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
  { href: ROUTES.MISSIONS, label: "Missions", icon: Target },
  { href: ROUTES.HEALTH, label: "Health", icon: Activity },
  { href: ROUTES.JOURNAL, label: "Journal", icon: PenSquare },
  { href: ROUTES.ODYSSEY, label: "AI", icon: Bot },
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

function DockInner() {
  const pathname = usePathname()
  const { mode, setCommandPalette, navPosition, setNavPosition } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 639px)")

  // Active route matching — exact OR prefix match for nested routes
  const isActive = (href: string) => {
    if (href === ROUTES.HOME) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

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

  // ---------- REF-BASED DRAG (no React re-renders during drag) ----------
  const isDraggingRef = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 }) // cursor offset from element center
  const committedRef = useRef({ x: navPosition.x, y: navPosition.y })

  // Keep committedRef in sync when navPosition changes externally
  useEffect(() => {
    committedRef.current = { x: navPosition.x, y: navPosition.y }
  }, [navPosition])

  const clampToViewport = useCallback((cx: number, cy: number) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const el = barRef.current
    if (!el) return { x: cx, y: cy }
    const w = el.offsetWidth
    const h = el.offsetHeight
    return {
      x: Math.max(w / 2, Math.min(vw - w / 2, cx)),
      y: Math.max(h / 2 + 4, Math.min(vh - h / 2 - 4, cy)),
    }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isMobile || !dockRef.current) return
    // Ignore if target is a link, button, or the resize handle
    const target = e.target as HTMLElement
    if (target.closest("a") || target.closest("button") || target.closest("[data-resize-handle]")) return

    e.preventDefault()
    const el = dockRef.current
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    dragOffset.current = { x: e.clientX - centerX, y: e.clientY - centerY }

    isDraggingRef.current = true
    el.style.transition = "none"
    el.setPointerCapture(e.pointerId)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("pointercancel", onPointerUp)
  }, [isMobile]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return
    const el = dockRef.current
    if (!el) return
    const rawX = e.clientX - dragOffset.current.x
    const rawY = e.clientY - dragOffset.current.y
    const clamped = clampToViewport(rawX, rawY)
    el.style.left = clamped.x + "px"
    el.style.top = clamped.y + "px"
  }, [clampToViewport])

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false
    const el = dockRef.current
    if (!el) return
    el.removeEventListener("pointermove", onPointerMove)
    el.removeEventListener("pointerup", onPointerUp)
    el.removeEventListener("pointercancel", onPointerUp)
    el.style.transition = ""
    // Read current inline position (set during drag)
    const left = parseFloat(el.style.left)
    const top = parseFloat(el.style.top)
    if (!isNaN(left) && !isNaN(top)) {
      const w = el.offsetWidth
      const h = el.offsetHeight
      const pos = { x: left, y: top }
      committedRef.current = pos
      setNavPosition(pos)
    }
    // Clear inline styles so React's style takes over on next render
    el.style.left = ""
    el.style.top = ""
  }, [setNavPosition]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- RESIZE (also ref-based) ----------
  const resizeRef = useRef({ active: false, startX: 0, startY: 0, startSize: 0 })

  const onResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const r = resizeRef.current
    r.active = true
    r.startX = e.clientX
    r.startY = e.clientY
    r.startSize = navSize
    document.addEventListener("pointermove", onResizePointerMove)
    document.addEventListener("pointerup", onResizePointerUp)
  }, [navSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const onResizePointerMove = useCallback((e: PointerEvent) => {
    const r = resizeRef.current
    if (!r.active) return
    if (orientation === "horizontal") {
      const delta = e.clientX - r.startX
      const newSize = Math.max(280, Math.min(window.innerWidth * 0.9, (r.startSize || 400) + delta * 2))
      setNavSize(newSize)
    } else {
      const delta = e.clientY - r.startY
      const newSize = Math.max(320, Math.min(window.innerHeight * 0.8, (r.startSize || 400) + delta))
      setNavSize(newSize)
    }
  }, [orientation, setNavSize])

  const onResizePointerUp = useCallback(() => {
    resizeRef.current.active = false
    document.removeEventListener("pointermove", onResizePointerMove)
    document.removeEventListener("pointerup", onResizePointerUp)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- DEFAULT POSITION ON FIRST LOAD ----------
  useEffect(() => {
    if (navPosition.x === 0 && navPosition.y === 0) {
      const vw = window.innerWidth
      const vh = window.innerHeight
      setNavPosition({ x: vw / 2, y: vh - 100 })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- RE-CLAMP ON RESIZE ----------
  useEffect(() => {
    let rafId: number
    const handle = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const pos = committedRef.current
        const clamped = clampToViewport(pos.x, pos.y)
        if (clamped.x !== pos.x || clamped.y !== pos.y) {
          setNavPosition(clamped)
        }
      })
    }
    window.addEventListener("resize", handle)
    return () => {
      window.removeEventListener("resize", handle)
      cancelAnimationFrame(rafId)
    }
  }, [clampToViewport, setNavPosition])

  // ---------- CLICK OUTSIDE TO CLOSE EXPANDED MENU ----------
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

  // ---------- RENDER ----------
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-1 h-[72px] glass-strong border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]" role="navigation" aria-label="Main navigation">
        {DOCK_PRIMARY.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all min-w-[56px] min-h-[48px] ${active ? "bg-white/10 text-brand-400" : "text-text-tertiary active:bg-white/[0.04]"}`} aria-current={active ? "page" : undefined}>
              <Icon className={`w-5 h-5 ${active ? "text-brand-400" : ""}`} />
              <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  const sections = mode === "study" ? studySections : workSections
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      ref={dockRef}
      className="fixed z-50 select-none touch-none"
      style={{
        left: navPosition.x,
        top: navPosition.y,
        transform: "translate(-50%, -50%)",
      }}
      onPointerDown={onPointerDown}
      role="navigation"
      aria-label="Main navigation"
    >
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
            role="menu"
          >
            {sections.map((section) => (
              <div key={section.label} className="mb-4 last:mb-0" role="none">
                <p className="text-[11px] font-bold tracking-widest text-text-muted uppercase mb-2 px-1">
                  {section.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link key={item.href} href={item.href} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all interactive-scale", active ? "text-white bg-brand-500/10 border border-brand-500/20" : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]")} role="menuitem" aria-current={active ? "page" : undefined}>
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

      <div
        ref={barRef}
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
      >
        {/* Drag handle */}
        <div className={cn(
          "flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors",
          isHorizontal ? "mr-1 pointer-events-none" : "mb-1 pointer-events-none"
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
          const active = isActive(item.href)
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
              aria-current={active ? "page" : undefined}
              title={item.label}
            >
              <div
                className={cn(
                  "flex items-center justify-center transition-colors rounded-xl",
                  isHorizontal ? "h-10 w-10" : "h-9 w-9 shrink-0",
                  active
                    ? isHorizontal ? "text-brand-400" : "text-brand-400 bg-brand-500/10"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <Icon className="w-[22px] h-[22px]" />
              </div>
              <span className={cn(
                "font-medium leading-tight text-center",
                isHorizontal ? "text-[12px]" : "text-[13px]",
                active ? "text-brand-400" : "text-text-tertiary"
              )}>
                {item.label}
              </span>
              {active && isHorizontal && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" />
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
            isActive(ROUTES.SETTINGS) ? "text-brand-400" : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.06]"
          )}
          title="Settings"
          aria-current={isActive(ROUTES.SETTINGS) ? "page" : undefined}
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
          data-resize-handle
          className={cn(
            "absolute z-10 flex items-center justify-center text-text-muted opacity-40 hover:opacity-100 transition-opacity",
            isHorizontal
              ? "right-0 top-0 bottom-0 w-4 cursor-ew-resize"
              : "left-0 right-0 bottom-0 h-4 cursor-ns-resize"
          )}
          style={{ touchAction: "none" }}
          onPointerDown={onResizePointerDown}
        >
          <div className={cn(
            "bg-white/20 rounded-full",
            isHorizontal ? "w-1 h-8" : "h-1 w-8"
          )} />
        </div>
      </div>
    </div>
  )
}

export const Dock = memo(DockInner)
