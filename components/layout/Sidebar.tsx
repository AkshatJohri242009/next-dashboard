"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard, Activity, Dumbbell, Weight, FolderGit2, Moon, TrendingUp,
  ChevronLeft, ChevronRight, Sparkles, X,
  BookOpen, Calendar, FileText, Volume2, Clock, BarChart3, Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { useMediaQuery } from "@/lib/use-media-query"

const workNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stocks",   label: "Stocks",   icon: TrendingUp },
  { href: "/odyssey",  label: "Odysseus", icon: Bot },
  { href: "/health",   label: "Health",   icon: Activity },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/weight", label: "Weight", icon: Weight },
  { href: "/sleep", label: "Sleep", icon: Moon },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
]

const studyNav = [
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/study/stats", label: "Stats", icon: BarChart3 },
  { href: "/study/tasks", label: "Tasks", icon: LayoutDashboard },
  { href: "/study/exams", label: "Exams", icon: Calendar },
  { href: "/study/files", label: "Files", icon: FileText },
  { href: "/study/sounds", label: "Sounds", icon: Volume2 },
  { href: "/study/commute", label: "Commute", icon: Clock },
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
  const navItems = mode === "study" ? studyNav : workNav

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
        className="fixed left-0 top-0 z-40 h-screen flex flex-col glass-strong border-r border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center gap-3 h-14 px-4 shrink-0 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {(!isMobile && sidebarOpen) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-bold text-gradient truncate"
              >
                {mode === "study" ? "Study Mode" : "Dashboard"}
              </motion.span>
            )}
          </AnimatePresence>
          {isMobile && (
            <span className="text-sm font-bold text-gradient truncate">{mode === "study" ? "Study Mode" : "Dashboard"}</span>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileMenu(false)}
              className="ml-auto h-8 w-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "text-white bg-brand-500/10 border border-brand-500/20"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]",
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-400 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-white/[0.06] space-y-1">
          {!isMobile && mode === "work" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              onClick={() => setAIPanel(!aiPanelOpen)}
              className="flex items-center gap-3 px-3 h-10 w-full rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>AI Assistant</span>}
            </motion.button>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-10 w-full rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
