"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { AutomationPanel } from "@/components/life/AutomationPanel"
import { generateForecast, type Forecast } from "@/lib/forecast-engine"
import { Calendar, TrendingUp, Moon, Dumbbell, Brain, Target, CheckCircle2, Flame, Zap } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

function DirectionBadge({ direction }: { direction: "improving" | "declining" | "stable" }) {
  const color = direction === "improving" ? "var(--success)" : direction === "declining" ? "var(--danger)" : "var(--warning)"
  return (
    <span className="text-[10px] font-medium" style={{ color }}>
      {direction === "improving" ? "↑ Improving" : direction === "declining" ? "↓ Declining" : "→ Stable"}
    </span>
  )
}

export default function ReviewsPage() {
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [weekStart, setWeekStart] = useState("")
  const [monthStart, setMonthStart] = useState("")

  useEffect(() => {
    setForecast(generateForecast())
    try {
      const ch = JSON.parse(localStorage.getItem("lifeos_chapters") || "[]")
      setChapters(ch)
      const hb = JSON.parse(localStorage.getItem("lifeos_habits") || "[]")
      setHabits(hb)
    } catch {}
    const now = new Date()
    const ws = new Date(now)
    ws.setDate(ws.getDate() - ws.getDay())
    setWeekStart(ws.toISOString().slice(0, 10))
    const ms = new Date(now.getFullYear(), now.getMonth(), 1)
    setMonthStart(ms.toISOString().slice(0, 10))
  }, [])

  const weekGoalCompletions = (() => {
    const day = 86400000
    const weekAgo = Date.now() - 7 * day
    if (!forecast) return 0
    return Math.round(forecast.habitProjections.reduce((a, h) => a + h.projected7Day, 0) / Math.max(1, forecast.habitProjections.length))
  })()

  const completedChapters = chapters.filter((c: any) => c.completed).length
  const habitsLoggedToday = habits.filter((h: any) => h.logs?.includes(new Date().toISOString().slice(0, 10))).length
  const totalHabits = habits.length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Reviews & Forecast</h1>
        <p className="text-sm text-white/40 mt-1">Weekly and monthly performance overviews with AI-powered projections.</p>
      </div>

      <JarvisInsightBar />

      {/* Period Selectors */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <div className="card-elevated px-4 py-3 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-white/30" />
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">Week Starting</p>
            <p className="text-xs font-medium text-white/70">{weekStart}</p>
          </div>
        </div>
        <div className="card-elevated px-4 py-3 flex items-center gap-3">
          <Calendar className="w-4 h-4 text-white/30" />
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">Month</p>
            <p className="text-xs font-medium text-white/70">{monthStart?.slice(0, 7)}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="metric-value text-orange-400">{habitsLoggedToday}/{totalHabits}</p>
          <p className="metric-label">Habits Today</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <CheckCircle2 className="w-4 h-4 text-brand mx-auto mb-1" />
          <p className="metric-value text-brand">{completedChapters}</p>
          <p className="metric-label">Chapters Done</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Target className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="metric-value text-accent">{forecast?.habitProjections.length || 0}</p>
          <p className="metric-label">Tracked Habits</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Brain className="w-4 h-4 text-info mx-auto mb-1" />
          <p className="metric-value text-info">{weekGoalCompletions}x</p>
          <p className="metric-label">Avg Weekly</p>
        </div>
      </motion.div>

      {/* Forecast Panel */}
      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <TrendingUp className="w-4 h-4 text-brand" />
          <h3 className="section-title text-sm">Forecast Engine</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs text-white/60">Sleep</span>
            </div>
            <p className="text-lg font-bold text-white/80">{forecast?.sleepTrend.avgHours || "—"}h</p>
            {forecast && <DirectionBadge direction={forecast.sleepTrend.direction} />}
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-3.5 h-3.5 text-brand" />
              <span className="text-xs text-white/60">Gym</span>
            </div>
            <p className="text-lg font-bold text-white/80">{forecast?.gymTrend.weeklyAvg || "—"}x/wk</p>
            {forecast && <DirectionBadge direction={forecast.gymTrend.direction} />}
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-white/60">Mood</span>
            </div>
            <p className="text-lg font-bold text-white/80 capitalize">{forecast?.moodTrend.dominant || "—"}</p>
            <p className="text-[10px] text-white/40">{forecast?.moodTrend.positivityRate || 0}% positive</p>
          </div>
        </div>

        <h4 className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">Habit Projections (next 30 days)</h4>
        <div className="space-y-2">
          {forecast?.habitProjections.slice(0, 8).map((h, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
              <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span className="text-xs text-white/70 flex-1 min-w-0 truncate">{h.name}</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-white/30">{h.currentStreak}d streak</span>
                <span className="text-white/50">→</span>
                <span className="text-brand font-semibold">{h.projected7Day}d / 7d</span>
                <span className="text-accent font-semibold">{h.projected30Day}d / 30d</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Brain className="w-4 h-4 text-accent" />
          <h3 className="section-title text-sm">AI Recommendations</h3>
        </div>
        <div className="space-y-2">
          {forecast?.recommendations.map((r, i) => (
            <div key={i} className="insight-card flex items-center gap-3 py-3">
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">{i + 1}</div>
              <p className="text-xs text-white/70">{r}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Automations */}
      <motion.div variants={item}>
        <div className="card-elevated p-4 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <h3 className="section-title text-sm">Automations</h3>
          </div>
          <AutomationPanel />
        </div>
      </motion.div>
    </motion.div>
  )
}
