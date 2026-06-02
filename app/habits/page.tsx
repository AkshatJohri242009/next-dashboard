"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { HabitsModule } from "@/components/home/HabitsModule"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Flame, Target, TrendingUp, Zap } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function HabitsPage() {
  const [stats, setStats] = useState({ total: 0, activeStreaks: 0, bestStreak: 0, todayDone: 0 })

  useEffect(() => {
    try {
      const habits = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
      const today = new Date().toISOString().slice(0, 10)
      const total = habits.length
      const todayDone = habits.filter((h: any) => h.logs?.includes(today)).length
      const activeStreaks = habits.filter((h: any) => (h.streak || 0) >= 3).length
      const bestStreak = Math.max(0, ...habits.map((h: any) => h.streak || 0))
      setStats({ total, activeStreaks, bestStreak, todayDone })
    } catch {}
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Habits</h1>
        <p className="text-sm text-white/40 mt-1">Daily habit tracking with streaks and category management.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="metric-value text-orange-400">{stats.todayDone}/{stats.total}</p>
          <p className="metric-label">Today</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Zap className="w-4 h-4 text-brand mx-auto mb-1" />
          <p className="metric-value text-brand">{stats.activeStreaks}</p>
          <p className="metric-label">Active Streaks</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Target className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="metric-value text-accent">{stats.bestStreak}d</p>
          <p className="metric-label">Best Streak</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
          <p className="metric-value text-success">{stats.total > 0 ? Math.round((stats.activeStreaks / stats.total) * 100) : 0}%</p>
          <p className="metric-label">Consistency</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <HabitsModule />
      </motion.div>
    </motion.div>
  )
}
