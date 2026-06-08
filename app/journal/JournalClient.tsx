"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { JournalModule } from "@/components/life/JournalModule"
import { MoodTrendChart } from "@/components/journal/MoodTrendChart"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { onDataChanged } from "@/lib/events"
import type { JournalEntry } from "@/lib/types"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function computeStats() {
  try {
    const entries: JournalEntry[] = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
    const total = entries.length
    const recent = entries.filter(e => new Date(e.createdAt).getTime() > Date.now() - 7 * 86400000)
    const goodMoods = recent.filter(e => e.mood === "great" || e.mood === "good").length
    const badMoods = recent.filter(e => e.mood === "bad" || e.mood === "awful").length
    const positivity = recent.length > 0 ? Math.round((goodMoods / recent.length) * 100) : 0
    return { entries, total, weekly: recent.length, positivity, toughDays: badMoods }
  } catch {
    return { entries: [] as JournalEntry[], total: 0, weekly: 0, positivity: 0, toughDays: 0 }
  }
}

export default function JournalPageClient() {
  const [stats, setStats] = useState(() => computeStats())

  const refresh = useCallback(() => setStats(computeStats()), [])

  useEffect(() => {
    const unsub = onDataChanged(({ keys }) => {
      if (keys.includes("lifeos_journal")) refresh()
    })
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", refresh)
    return () => { unsub(); window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh) }
  }, [refresh])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Journal</h1>
        <p className="text-sm text-text-tertiary mt-1">Daily reflections, mood tracking, and pattern recognition.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 sm:flex-[2] card-elevated p-4 sm:p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${stats.positivity >= 60 ? "bg-semantic-success/15" : stats.positivity >= 40 ? "bg-semantic-warning/15" : "bg-semantic-danger/15"}`}>
            <span className={`text-lg font-bold ${stats.positivity >= 60 ? "text-semantic-success" : stats.positivity >= 40 ? "text-semantic-warning" : "text-semantic-danger"}`}>
              {stats.positivity}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Positivity Rate</p>
            <p className="text-xs text-text-tertiary mt-0.5">{stats.weekly} entries this week · {stats.total} total</p>
          </div>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-text-primary">{stats.total}</p>
          <p className="metric-label">Total</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-semantic-info">{stats.weekly}</p>
          <p className="metric-label">This Week</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className={`metric-value ${stats.toughDays > 3 ? "text-semantic-danger" : "text-semantic-success"}`}>{stats.toughDays}</p>
          <p className="metric-label">Tough Days</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <MoodTrendChart entries={stats.entries} />
      </motion.div>

      <motion.div variants={item}>
        <JournalModule />
      </motion.div>
    </motion.div>
  )
}
