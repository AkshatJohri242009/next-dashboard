"use client"

import { useEffect, useState } from "react"
import type { Habit } from "@/lib/types"
import { motion } from "framer-motion"
import { HabitsModule } from "@/components/home/HabitsModule"
import { HabitHeatmap } from "@/components/habits/HabitHeatmap"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Flame, Target, TrendingUp, Zap, Calendar } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function HabitsPageClient() {
  const [stats, setStats] = useState({ total: 0, activeStreaks: 0, bestStreak: 0, todayDone: 0 })

  useEffect(() => {
    try {
      const habits: Habit[] = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
      const today = new Date().toISOString().slice(0, 10)
      const total = habits.length
      const todayDone = habits.filter(h => h.logs?.includes(today)).length
      const activeStreaks = habits.filter(h => (h.streak || 0) >= 3).length
      const bestStreak = Math.max(0, ...habits.map(h => h.streak || 0))
      setStats({ total, activeStreaks, bestStreak, todayDone })
    } catch {}
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Habits</h1>
        <p className="text-sm text-text-tertiary mt-1">Daily habit tracking with streaks and category management.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 sm:flex-[2] card-elevated p-4 sm:p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-400/15 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Today&apos;s Progress</p>
            <p className="text-xs text-text-tertiary mt-0.5">{stats.todayDone} of {stats.total} habits done today</p>
          </div>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-text-primary">{stats.total}</p>
          <p className="metric-label">Total</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-semantic-warning">{stats.activeStreaks}</p>
          <p className="metric-label">Streaks</p>
        </div>
        <div className="card-elevated p-3 text-center min-w-[80px]">
          <p className="metric-value text-accent">{stats.bestStreak}d</p>
          <p className="metric-label">Best</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <HabitHeatmap />
      </motion.div>

      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <HabitsModule />
      </motion.div>
    </motion.div>
  )
}
