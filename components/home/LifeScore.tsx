"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Info } from "lucide-react"
import { calculateLifeScore, computeMomentum } from "@/lib/life-engine"
import { useStore } from "@/lib/store"

const dimensionWeights: Record<string, string> = {
  health: "25%",
  fitness: "20%",
  learning: "20%",
  projects: "15%",
  wealth: "10%",
  habits: "10%",
}

const dimensionDescriptions: Record<string, string> = {
  health: "Water ×40pts + Sleep ×40pts + Supplements ×20pts",
  fitness: "Gym sessions this week (capped at 7)",
  learning: "Average test/mock score %",
  projects: "Today's goal completion rate",
  wealth: "Currently a placeholder (always 50)",
  habits: "Average of Health, Fitness, Learning",
}

export function LifeScore() {
  const { health, gym } = useStore()
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState({ health: 0, fitness: 0, learning: 0, projects: 0, wealth: 0, habits: 0 })
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const goals = JSON.parse(localStorage.getItem("goals:" + new Date().toISOString().slice(0, 10)) || "[]")
    const tasksTotal = goals.length
    const tasksDone = goals.filter((g: any) => g.done).length
    const studyScores: number[] = []
    try {
      const scores = JSON.parse(localStorage.getItem("study_scores_v1") || "[]")
      scores.forEach((s: any) => { if (s.score && s.total) studyScores.push(Math.round(s.score / s.total * 100)) })
    } catch {}
    const sleepData = JSON.parse(localStorage.getItem("last_sleep_hours") || "8")
    const sleepMinutes = typeof sleepData === "number" ? sleepData * 60 : 480

    const result = calculateLifeScore({
      waterMl: health.waterMl || 0,
      sleepMinutes,
      gymLogs: gym.logs.length,
      tasksDone,
      tasksTotal,
      studyScores,
      supplementsDone: Object.values(health.done || {}).filter(Boolean).length,
      supplementsTotal: Math.max(Object.keys(health.done || {}).length, 1),
    })
    setScore(result.score)
    setBreakdown(result.breakdown)
  }, [health, gym])

  useEffect(() => {
    const duration = 1500
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  const radius = 56
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - animatedScore / 100)

  const labels: { key: keyof typeof breakdown; label: string }[] = [
    { key: "health", label: "Health" },
    { key: "fitness", label: "Fitness" },
    { key: "learning", label: "Learning" },
    { key: "projects", label: "Projects" },
    { key: "wealth", label: "Wealth" },
    { key: "habits", label: "Habits" },
  ]

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-6 sm:gap-8">
        <div className="relative flex-shrink-0">
          <svg width="136" height="136" className="transform -rotate-90">
            <circle cx="68" cy="68" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="68" cy="68" r={radius} fill="none" stroke="var(--brand)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="score-ring"
              style={{ filter: "drop-shadow(0 0 8px color-mix(in srgb, var(--brand) 50%, transparent))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight text-text-primary">{animatedScore}</span>
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mt-0.5">Life Score</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-3">
          {labels.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-secondary font-medium">
                  {label}
                  <span className="text-[11px] text-text-muted ml-1">{dimensionWeights[key]}</span>
                  {key === "wealth" && <span className="text-[11px] text-text-muted ml-1">(placeholder)</span>}
                </span>
                <span className="text-xs font-semibold" style={{ color: breakdown[key] >= 70 ? "var(--success)" : breakdown[key] >= 40 ? "var(--warning)" : "var(--danger)" }}>
                  {breakdown[key]}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${breakdown[key]}%`, background: `linear-gradient(to right, ${(breakdown as any)[key] >= 70 ? "var(--success)" : breakdown[key] >= 40 ? "var(--warning)" : "var(--danger)"}, color-mix(in srgb, var(--brand) 50%, transparent))` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setShowInfo(!showInfo)}
          className="self-start h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-white/[0.04] transition-all shrink-0"
          title="How is this calculated?"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-5 pt-4 border-t border-white/5 space-y-2"
        >
          <p className="text-xs text-text-tertiary font-medium tracking-wider uppercase">How Life Score is calculated</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Life Score = Health×25% + Fitness×20% + Learning×20% + Projects×15% + Wealth×10% + Habits×10%
          </p>
          {labels.map(({ key, label }) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-xs font-semibold mt-0.5 shrink-0 w-20" style={{ color: breakdown[key] >= 70 ? "var(--success)" : breakdown[key] >= 40 ? "var(--warning)" : "var(--danger)" }}>{label} {dimensionWeights[key]}</span>
              <span className="text-xs text-text-muted">{dimensionDescriptions[key]}</span>
            </div>
          ))}
        </motion.div>
      )}

      <div className="flex items-center gap-8 mt-5 pt-4 border-t border-white/5">
        {Object.entries(computeMomentum()).map(([period, value]) => (
          <div key={period} className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary font-medium capitalize">{period}</span>
              <span className="text-sm font-bold" style={{ color: value >= 70 ? "var(--success)" : value >= 40 ? "var(--warning)" : "var(--danger)" }}>
                {value}%
              </span>
            </div>
            <span className="text-[11px] text-text-muted mt-0.5">{period === "daily" ? "Today's goal completion" : period === "weekly" ? "7-day goal completion" : "Avg of daily + weekly"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}