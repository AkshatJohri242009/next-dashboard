"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb,
  Dumbbell, Moon, Flame, Brain, Target, Droplets,
  BarChart3, Sparkles,
} from "lucide-react"
import { generateProjections, type FutureSelfReport, type TrajectoryProjection } from "@/lib/future-engine"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: Record<string, any> = {
  fitness: Dumbbell,
  health: Moon,
  habits: Flame,
  mental: Brain,
  productivity: Target,
  hydration: Droplets,
}

const CATEGORY_COLORS: Record<string, string> = {
  fitness: "text-success",
  health: "text-brand-400",
  habits: "text-warning",
  mental: "text-accent-400",
  productivity: "text-brand-400",
  hydration: "text-info",
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  fitness: "from-success/5 to-transparent",
  health: "from-brand-500/5 to-transparent",
  habits: "from-warning/5 to-transparent",
  mental: "from-accent-500/5 to-transparent",
  productivity: "from-brand-500/5 to-transparent",
  hydration: "from-info/5 to-transparent",
}

export function FutureSelfPanel() {
  const [report, setReport] = useState<FutureSelfReport | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<number>(0)

  useEffect(() => {
    setReport(generateProjections())
  }, [])

  if (!report) {
    return <p className="text-center text-sm text-white/30 py-8">Generating projections...</p>
  }

  const projection = report.projections[selectedMetric]

  const maxProjection = Math.max(
    projection?.projected3Month || 1,
    projection?.projected6Month || 1,
    projection?.projected1Year || 1,
    1
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {report.projections.map((p, idx) => {
          const Icon = CATEGORY_ICONS[p.category] || BarChart3
          const color = CATEGORY_COLORS[p.category] || "text-white/50"
          const grad = CATEGORY_GRADIENTS[p.category] || "from-white/[0.02]"
          return (
            <button key={idx} onClick={() => setSelectedMetric(idx)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                selectedMetric === idx
                  ? "bg-gradient-to-br border-brand-500/40 " + grad
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              )}
            >
              <Icon className={cn("w-4 h-4 mb-1", color)} />
              <p className="text-xs font-medium text-white/70 truncate">{p.metric}</p>
              <p className={cn("text-lg font-bold", color)}>{p.currentValue}{p.unit.includes("%") ? "%" : ""}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {p.trend === "improving" && <TrendingUp className="w-3 h-3 text-success" />}
                {p.trend === "declining" && <TrendingDown className="w-3 h-3 text-danger" />}
                {p.trend === "stable" && <Minus className="w-3 h-3 text-white/30" />}
                <span className="text-[10px] text-white/30">{p.trend}</span>
              </div>
            </button>
          )
        })}
      </div>

      {projection && (
        <motion.div
          key={selectedMetric}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.02] to-transparent"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white/80">{projection.metric}</h3>
              <p className="text-[10px] text-white/30">Confidence: {projection.confidence}%</p>
            </div>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border font-medium",
              projection.confidence >= 70 ? "bg-success/10 text-success border-success/20" :
              projection.confidence >= 40 ? "bg-warning/10 text-warning border-warning/20" :
              "bg-white/[0.04] text-white/40 border-white/[0.06]"
            )}>
              {projection.confidence >= 70 ? "High Confidence" : projection.confidence >= 40 ? "Medium" : "Low Data"}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <ProjectionBar label="Current" value={projection.currentValue} max={maxProjection} unit={projection.unit} color="bg-white/40" />
            <ProjectionBar label="3 Months" value={projection.projected3Month} max={maxProjection} unit={projection.unit} color="bg-brand-400" />
            <ProjectionBar label="6 Months" value={projection.projected6Month} max={maxProjection} unit={projection.unit} color="bg-brand-500" />
            <ProjectionBar label="1 Year" value={projection.projected1Year} max={maxProjection} unit={projection.unit} color="bg-accent-400" />
          </div>

          <div className="space-y-2">
            {projection.risk && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-danger/[0.05] border border-danger/10">
                <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                <p className="text-xs text-danger/80">{projection.risk}</p>
              </div>
            )}
            {projection.opportunity && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-success/[0.05] border border-success/10">
                <Lightbulb className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-success/80">{projection.opportunity}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-accent-500/5 border border-white/[0.06]">
        <p className="text-xs text-white/40 mb-2">Assessment</p>
        <p className="text-sm text-white/70">{report.overallAssessment}</p>
      </div>
    </div>
  )
}

function ProjectionBar({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = max > 0 ? Math.min(100, value / max * 100) : 0
  const displayValue = unit.includes("day") ? Math.round(value) : unit.includes("%") ? `${value}` : value % 1 === 0 ? value.toString() : value.toFixed(1)
  const displayUnit = unit.includes("%") ? "%" : unit.includes("day") ? " days" : unit.includes("wk") ? "/wk" : unit.includes("hours") ? "h" : unit.includes("ml") ? "ml" : ` ${unit}`
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-[10px] text-white/30 shrink-0">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color} opacity-70`}
        />
      </div>
      <span className="w-20 text-xs text-right text-white/50 font-medium">{displayValue}{displayUnit}</span>
    </div>
  )
}
