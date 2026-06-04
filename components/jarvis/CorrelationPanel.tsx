"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, TrendingDown, Minus, Brain, Lightbulb,
  Activity, Moon, Dumbbell, Droplets, Target,
} from "lucide-react"
import { discoverCorrelations, generateCorrelationInsight, type Correlation } from "@/lib/correlation-engine"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<string, any> = {
  Sleep: Moon,
  Mood: Brain,
  Gym: Dumbbell,
  Productivity: Target,
  Hydration: Droplets,
  Habits: Activity,
}

export function CorrelationPanel() {
  const [correlations, setCorrelations] = useState<Correlation[]>([])
  const [filter, setFilter] = useState<"all" | "strong" | "moderate" | "weak">("all")

  useEffect(() => {
    const results = discoverCorrelations()
    setCorrelations(results)
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return correlations
    return correlations.filter(c => c.strength === filter)
  }, [correlations, filter])

  const insight = useMemo(() => generateCorrelationInsight(correlations), [correlations])

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-accent-500/5 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-medium text-text-tertiary">Pattern Insight</span>
        </div>
        <p className="text-sm text-text-secondary">{insight}</p>
      </div>

      {correlations.length === 0 && (
        <p className="text-center text-sm text-text-tertiary py-8">Track your life for 7+ days to discover patterns. The more data, the smarter the insights.</p>
      )}

      {correlations.length > 0 && (
        <>
          <div className="flex gap-1.5">
            {(["all", "strong", "moderate", "weak"] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={cn("px-3 h-7 rounded-lg text-xs font-medium border transition-all",
                  filter === s ? "bg-brand-500/20 text-brand-400 border-brand-500/30" : "text-text-tertiary border-white/[0.06] hover:text-text-tertiary"
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((corr) => {
              const IconA = CATEGORY_ICONS[corr.sourceA] || Activity
              const IconB = CATEGORY_ICONS[corr.sourceB] || Activity
              const DirectionIcon = corr.direction === "positive" ? TrendingUp : TrendingDown

              const strengthColors: Record<string, string> = {
                strong: "border-brand-500/30 bg-brand-500/5",
                moderate: "border-white/[0.08] bg-white/[0.02]",
                weak: "border-white/[0.04]",
              }

              return (
                <motion.div
                  key={corr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("p-3 rounded-xl border", strengthColors[corr.strength])}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <IconA className="w-3.5 h-3.5 text-text-tertiary" />
                        <span className="text-xs text-text-tertiary">{corr.sourceA}</span>
                      </div>
                      <DirectionIcon className={cn("w-3.5 h-3.5", corr.direction === "positive" ? "text-success" : "text-danger")} />
                      <div className="flex items-center gap-1">
                        <IconB className="w-3.5 h-3.5 text-text-tertiary" />
                        <span className="text-xs text-text-tertiary">{corr.sourceB}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium",
                        corr.strength === "strong" ? "bg-brand-500/10 text-brand-400" :
                        corr.strength === "moderate" ? "bg-white/[0.04] text-text-tertiary" : "text-text-tertiary"
                      )}>
                        {corr.strength}
                      </span>
                      <span className="text-xs text-text-muted">{corr.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">{corr.insight}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-text-tertiary">{corr.sourceA}: {typeof corr.valueA === 'number' ? corr.valueA.toFixed(1) : corr.valueA}</span>
                    <Minus className="w-3 h-3 text-text-muted" />
                    <span className="text-[11px] text-text-tertiary">{corr.sourceB}: {typeof corr.valueB === 'number' ? corr.valueB.toFixed(1) : corr.valueB}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
