"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { calculateLifeScore, computeMomentum } from "@/lib/life-engine"
import { useStore } from "@/lib/store"

export function LifeScore() {
  const { health, gym } = useStore()
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState({ health: 0, fitness: 0, learning: 0, projects: 0, wealth: 0, habits: 0 })
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const goals = JSON.parse(localStorage.getItem("goals:" + new Date().toISOString().slice(0, 10)) || "[]")
    const tasksTotal = goals.length
    const tasksDone = goals.filter((g: any) => g.done).length
    const studyScores: number[] = []
    try {
      const scores = JSON.parse(localStorage.getItem("study_scores_v1") || "[]")
      scores.forEach((s: any) => { if (s.score && s.total) studyScores.push(Math.round(s.score / s.total * 100)) })
    } catch {}

    const result = calculateLifeScore({
      waterMl: health.waterMl || 0,
      sleepMinutes: 0,
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
      <div className="flex items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg width="136" height="136" className="transform -rotate-90">
            <circle cx="68" cy="68" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="68" cy="68" r={radius} fill="none" stroke="var(--brand)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="score-ring"
              style={{ filter: "drop-shadow(0 0 8px color-mix(in srgb, var(--brand) 50%, transparent))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight text-white">{animatedScore}</span>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-0.5">Life Score</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-2.5">
          {labels.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-white/50 font-medium">{label}</span>
                <span className="text-[11px] font-semibold" style={{ color: breakdown[key] >= 70 ? "var(--success)" : breakdown[key] >= 40 ? "var(--warning)" : "var(--danger)" }}>
                  {breakdown[key]}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${breakdown[key]}%`, background: `linear-gradient(to right, ${(breakdown as any)[key] >= 70 ? "var(--success)" : breakdown[key] >= 40 ? "var(--warning)" : "var(--danger)"}, color-mix(in srgb, var(--brand) 50%, transparent))` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/5">
        {Object.entries(computeMomentum()).map(([period, value]) => (
          <div key={period} className="flex items-center gap-2">
            <span className="text-[11px] text-white/40 font-medium capitalize">{period}</span>
            <span className="text-sm font-bold" style={{ color: value >= 70 ? "var(--success)" : value >= 40 ? "var(--warning)" : "var(--danger)" }}>
              {value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
