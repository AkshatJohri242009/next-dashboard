"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard, Activity, Dumbbell, Weight, FolderGit2, Moon, TrendingUp,
  ChevronLeft, ChevronRight, Sparkles, X,
  BookOpen, Calendar, FileText, Volume2, Clock, BarChart3, Bot, Code2,
  PenSquare, Brain, GitBranch, Flag, TrendingUp as ForecastIcon, Zap, Flame, Timer,
  Mic, Trophy, Activity as CorrIcon, Settings, Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/use-media-query"
import { ROUTES } from "@/lib/routes"

interface NavSection {
  label: string
  items: { href: string; label: string; icon: any }[]
}

const workNav: NavSection[] = [
  {
    label: "Core",
    items: [
      { href: ROUTES.HOME, label: "Home", icon: LayoutDashboard },
      { href: ROUTES.JOURNAL,  label: "Journal", icon: PenSquare },
      { href: ROUTES.FOCUS,  label: "Focus", icon: Zap },
    ],
  },
  {
    label: "Life OS",
    items: [
      { href: ROUTES.HABITS,   label: "Habits",   icon: Flame },
      { href: ROUTES.LEARNING, label: "Learning", icon: Brain },
      { href: ROUTES.MISSIONS, label: "Missions", icon: Flag },
      { href: ROUTES.TIMELINE, label: "Timeline", icon: Clock },
      { href: ROUTES.DECISIONS, label: "Decisions", icon: GitBranch },
      { href: ROUTES.REVIEWS,  label: "Reviews",  icon: ForecastIcon },
    ],
  },
  {
    label: "Health",
    items: [
      { href: ROUTES.HEALTH,   label: "Health",   icon: Activity },
      { href: ROUTES.GYM, label: "Gym", icon: Dumbbell },
      { href: ROUTES.WEIGHT, label: "Weight", icon: Weight },
      { href: ROUTES.SLEEP, label: "Sleep", icon: Moon },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: ROUTES.ODYSSEY,    label: "JARVIS",   icon: Bot },
      { href: ROUTES.VOICE,      label: "Voice",    icon: Mic },
      { href: ROUTES.BRIEFINGS,  label: "Briefings", icon: Volume2 },
      { href: ROUTES.BRAIN,      label: "Brain",    icon: Zap },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: ROUTES.MEMORY,       label: "Memory",    icon: Brain },
      { href: ROUTES.CORRELATIONS, label: "Patterns",  icon: CorrIcon },
      { href: ROUTES.FUTURE,       label: "Future",    icon: Eye },
      { href: ROUTES.REPORT,       label: "Report",    icon: Trophy },
    ],
  },
  {
    label: "Data",
    items: [
      { href: ROUTES.STOCKS,       label: "Stocks",    icon: TrendingUp },
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

const studyNav: NavSection[] = [
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

export function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const { sidebarOpen, toggleSidebar, setAIPanel, aiPanelOpen, mobileMenuOpen, setMobileMenu, mode } = useStore()

  useEffect(() => {
    setMobileMenu(false)
  }, [pathname, setMobileMenu])

  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isMobile, mobileMenuOpen])

  const sidebarWidth = 240
  const collapsedWidth = 72
  const sections = mode === "study" ? studyNav : workNav

  return (
    <>
      {isMobile && mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-30 bg-black/60"
        />
      )}

      <motion.aside
        animate={{
          width: isMobile ? sidebarWidth : (sidebarOpen ? sidebarWidth : collapsedWidth),
          x: isMobile ? (mobileMenuOpen ? 0 : -sidebarWidth) : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 z-40 h-screen flex flex-col glass-strong overflow-hidden"
      >
        <div className="flex items-center gap-3 h-14 px-4 shrink-0 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <AnimatePresence>
            {(!isMobile && sidebarOpen) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-bold text-gradient truncate"
              >
                {mode === "study" ? "Study Mode" : "LifeOS"}
              </motion.span>
            )}
          </AnimatePresence>
          {isMobile && (
            <span className="text-sm font-bold text-gradient truncate">{mode === "study" ? "Study Mode" : "LifeOS"}</span>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileMenu(false)}
              className="ml-auto h-8 w-8 flex items-center justify-center text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-3 overflow-y-auto overflow-x-hidden">
          {sections.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <p className="px-3 pb-1 text-[11px] font-bold tracking-widest text-text-muted uppercase">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                        <motion.div
                        className={cn(
                          "relative flex items-center gap-3 px-3 h-9 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "text-white bg-brand-500/10 border border-brand-500/20"
                            : "text-text-tertiary hover:text-text-primary hover:bg-white/[0.04] hover:translate-x-0.5",
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="nav-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-400 rounded-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <item.icon className="w-4 h-4 shrink-0" />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-white/[0.06] space-y-1">
          {!isMobile && mode === "work" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              onClick={() => setAIPanel(!aiPanelOpen)}
              className="flex items-center gap-3 px-3 h-9 w-full rounded-xl text-sm font-medium text-text-tertiary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>AI Assistant</span>}
            </motion.button>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-9 w-full rounded-xl text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04] transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
