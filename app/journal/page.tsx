"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { JournalModule } from "@/components/life/JournalModule"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function JournalPage() {
  const [stats, setStats] = useState({ total: 0, weekly: 0, positivity: 0, toughDays: 0 })

  useEffect(() => {
    try {
      const entries = JSON.parse(localStorage.getItem("lifeos_journal") || "[]")
      const total = entries.length
      const recent = entries.filter((e: any) => new Date(e.createdAt).getTime() > Date.now() - 7 * 86400000)
      const goodMoods = recent.filter((e: any) => e.mood === "great" || e.mood === "good").length
      const badMoods = recent.filter((e: any) => e.mood === "bad" || e.mood === "awful").length
      const positivity = recent.length > 0 ? Math.round((goodMoods / recent.length) * 100) : 0
      setStats({ total, weekly: recent.length, positivity, toughDays: badMoods })
    } catch {}
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Journal</h1>
        <p className="text-sm text-white/40 mt-1">Daily reflections, mood tracking, and pattern recognition.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-brand">{stats.total}</p>
          <p className="metric-label">Total Entries</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{ color: stats.weekly > 0 ? "var(--success)" : "var(--text-muted)" }}>{stats.weekly}</p>
          <p className="metric-label">This Week</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{ color: stats.positivity >= 60 ? "var(--success)" : stats.positivity >= 40 ? "var(--warning)" : "var(--danger)" }}>
            {stats.positivity}%
          </p>
          <p className="metric-label">Positivity Rate</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{ color: stats.toughDays > 3 ? "var(--danger)" : "var(--success)" }}>{stats.toughDays}</p>
          <p className="metric-label">Tough Days (7d)</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <JournalModule />
      </motion.div>
    </motion.div>
  )
}
