"use client"

import { useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { AIPanel } from "@/components/layout/AIPanel"
import { SwipeHandler } from "@/components/layout/SwipeHandler"
import { ScrollToTop } from "@/components/layout/ScrollToTop"
import { MobileNav } from "@/components/layout/MobileNav"
import { VoiceButton } from "@/components/jarvis/VoiceButton"
import { JarvisPresence } from "@/components/jarvis/JarvisPresence"
import { useStore, type JarvisAlert, applyTheme } from "@/lib/store"
import { useJarvisStore } from "@/lib/jarvis-store"
import { autoExtractMemories } from "@/lib/memory-engine"
import { useMediaQuery } from "@/lib/use-media-query"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarOpen, loadGoals, loadHealth, loadGym, loadSleepLog, loadReminders, loadTrackedProjects, loadStudyData, loadStocks, fetchStockQuotes, stockHoldings, syncWithSupabase, theme, pushToTomorrow } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const lastDateRef = useRef(new Date().toISOString().slice(0, 10))
  const seededRef = useRef(false)

  const seedIfNew = useCallback(async () => {
    if (!session?.user?.id || seededRef.current) return
    seededRef.current = true
    try {
      const res = await fetch("/api/user/profile")
      const data = await res.json()
      if (data && !data.profile?.onboardingDone) {
        const localItems: Record<string, unknown> = {}
        const goalKeys: Record<string, unknown>[] = []
        for (let i = 0; i < 7; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = `goals:${d.toISOString().split("T")[0]}`
          const g = JSON.parse(localStorage.getItem(key) || "[]")
          if (Array.isArray(g) && g.length > 0) goalKeys.push(...g)
        }
        if (goalKeys.length > 0) localItems.goals = goalKeys
        const health = JSON.parse(localStorage.getItem("health_dashboard_v1") || "null")
        if (health) localItems.health = health
        const habits = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
        if (Array.isArray(habits) && habits.length > 0) localItems.habits = habits
        const journal = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
        if (Array.isArray(journal) && journal.length > 0) localItems.journal = journal

        if (Object.keys(localItems).length > 0) {
          await fetch("/api/data/migrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localItems),
          })
        } else {
          await fetch("/api/onboarding/seed", { method: "POST" })
        }
      }
    } catch {
      // silent fail - seed will run on profile page
    }
  }, [session])

  useEffect(() => {
    loadGoals()
    loadHealth()
    loadGym()
    loadSleepLog()
    loadReminders()
    loadStudyData()
    loadStocks()
    fetchStockQuotes()
    syncWithSupabase()
    useJarvisStore.getState().checkAuth()
    autoExtractMemories()
    seedIfNew()
    document.title = "LifeOS"
    applyTheme(theme)
    const syncInterval = setInterval(() => {
      syncWithSupabase()
      loadGoals()
      loadHealth()
      loadGym()
      loadSleepLog()
      loadReminders()
      loadTrackedProjects()
      loadStudyData()
      loadStocks()
      fetchStockQuotes()

      // Proactive JARVIS alerts
      try {
        const today = new Date().toISOString().slice(0, 10)
        const alerts: JarvisAlert[] = []
        const goals: { text: string; done: boolean }[] = JSON.parse(localStorage.getItem("goals:" + today) || "[]")
        const pending = goals.filter(g => !g.done)
        if (goals.length > 0 && goals.length === pending.length && new Date().getHours() >= 14) {
          alerts.push({ id: "goals-pending", icon: "🎯", title: "Goals not started", body: `${pending.length} goal(s) still pending. Start with the highest priority.`, type: "goal" })
        }
        const health: { waterMl?: number } = JSON.parse(localStorage.getItem("health_dashboard_v1") || "{}")
        if ((health.waterMl || 0) < 500 && new Date().getHours() >= 12) {
          alerts.push({ id: "water-low", icon: "💧", title: "Low hydration", body: `Only ${Math.round((health.waterMl || 0) / 2000 * 100)}% of daily water target.`, type: "health" })
        }
        const journal = JSON.parse(localStorage.getItem("lifeos_journal") || "[]") as { createdAt?: string }[]
        const todayJournal = journal.filter(e => e.createdAt?.startsWith(today))
        if (todayJournal.length === 0 && new Date().getHours() >= 20) {
          alerts.push({ id: "journal-missed", icon: "📝", title: "No journal today", body: "Reflect on your day — even a quick entry helps.", type: "journal" })
        }
        loadTrackedProjects()
        const { setJarvisAlerts } = useStore.getState()
        setJarvisAlerts(alerts)
      } catch {}

      const newToday = new Date().toISOString().slice(0, 10)
      if (newToday !== lastDateRef.current) {
        lastDateRef.current = newToday
        pushToTomorrow()
      }
    }, 60000)
    return () => clearInterval(syncInterval)
  }, [loadGoals, loadHealth, loadGym, loadSleepLog, loadReminders, loadTrackedProjects, loadStudyData, loadStocks, fetchStockQuotes, syncWithSupabase, theme, pushToTomorrow, seedIfNew])

  return (
    <>
      <Sidebar />
      <CommandPalette />
      <AIPanel />
      <SwipeHandler />
      <ScrollToTop />
      <div className="bg-ambient-center" />
      <VoiceButton />
      <JarvisPresence />
      <MobileNav />

      <div
        style={{
          marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 72),
          transition: "margin-left 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="min-h-screen"
      >
        <TopNav />
        <main className="p-4 md:p-6 lg:p-8 pb-[4.5rem] lg:pb-[env(safe-area-inset-bottom)] max-w-7xl mx-auto overflow-x-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  )
}
