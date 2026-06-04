"use client"

import { useEffect, useRef } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { AIPanel } from "@/components/layout/AIPanel"
import { SwipeHandler } from "@/components/layout/SwipeHandler"
import { ScrollToTop } from "@/components/layout/ScrollToTop"
import { MobileNav } from "@/components/layout/MobileNav"
import { VoiceButton } from "@/components/jarvis/VoiceButton"
import { JarvisPresence } from "@/components/jarvis/JarvisPresence"
import { useStore } from "@/lib/store"
import { useJarvisStore } from "@/lib/jarvis-store"
import { autoExtractMemories } from "@/lib/memory-engine"
import { useMediaQuery } from "@/lib/use-media-query"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, loadGoals, loadHealth, loadGym, loadSleepLog, loadReminders, loadTrackedProjects, loadStudyData, loadStocks, fetchStockQuotes, stockHoldings, syncWithSupabase, theme, pushToTomorrow } = useStore()
  const isMobile = useMediaQuery("(max-width: 1023px)")
  const lastDateRef = useRef(new Date().toISOString().slice(0, 10))

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
    document.title = "LifeOS"
    const root = document.documentElement
    root.style.setProperty("--brand", theme.brandColor)
    root.style.setProperty("--brand-500", theme.brandColor)
    root.style.setProperty("--accent", theme.accentColor)
    root.style.setProperty("--accent-500", theme.accentColor)
    root.classList.toggle("light", theme.mode === "light")
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
      const today = new Date().toISOString().slice(0, 10)
      if (today !== lastDateRef.current) {
        lastDateRef.current = today
        pushToTomorrow()
      }
    }, 30000)
    return () => clearInterval(syncInterval)
  }, [loadGoals, loadHealth, loadGym, loadSleepLog, loadReminders, loadTrackedProjects, loadStudyData, loadStocks, fetchStockQuotes, syncWithSupabase, theme, pushToTomorrow])

  return (
    <>
      <Sidebar />
      <CommandPalette />
      <AIPanel />
      <SwipeHandler />
      <ScrollToTop />
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
          {children}
        </main>
      </div>
    </>
  )
}
