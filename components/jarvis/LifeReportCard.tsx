"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Sparkles, Trophy, Dumbbell, BookOpen, Flame,
  Brain, GitBranch, Target, Moon, Activity,
  TrendingUp, Star, Quote, ChevronRight,
} from "lucide-react"
import { generateLifeReport, type LifeReport } from "@/lib/life-report"
import { cn } from "@/lib/utils"

const STAT_ICONS: Record<string, any> = {
  "Goals Completed": Trophy,
  "Gym Sessions": Dumbbell,
  "Journal Entries": BookOpen,
  "Habits Tracked": Flame,
  "Decisions Made": Brain,
  "Missions Completed": Star,
  "Chapters Completed": BookOpen,
  "Avg Sleep": Moon,
}

const STAT_COLORS: Record<string, string> = {
  "Goals Completed": "from-brand-400 to-accent-500",
  "Gym Sessions": "from-success to-success/50",
  "Journal Entries": "from-brand-400 to-white/50",
  "Habits Tracked": "from-warning to-warning/50",
  "Decisions Made": "from-accent-400 to-accent-500",
  "Missions Completed": "from-success to-accent-500",
  "Chapters Completed": "from-brand-500 to-brand-400",
  "Avg Sleep": "from-info to-brand-400",
}

const STAT_BG: Record<string, string> = {
  "Goals Completed": "bg-brand-500/10 border-brand-500/20",
  "Gym Sessions": "bg-success/[0.08] border-success/[0.15]",
  "Journal Entries": "bg-white/[0.04] border-white/[0.08]",
  "Habits Tracked": "bg-warning/[0.08] border-warning/[0.15]",
  "Decisions Made": "bg-accent-500/[0.08] border-accent-500/[0.15]",
  "Missions Completed": "bg-success/[0.06] border-success/[0.12]",
  "Chapters Completed": "bg-brand-500/[0.06] border-brand-500/[0.12]",
  "Avg Sleep": "bg-info/[0.08] border-info/[0.15]",
}

export function LifeReportCard() {
  const [report, setReport] = useState<LifeReport | null>(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedStat, setSelectedStat] = useState<number | null>(null)

  useEffect(() => {
    setReport(generateLifeReport(year))
  }, [year])

  if (!report) return null

  const prevYear = () => setYear(y => y - 1)
  const nextYear = () => setYear(y => y + 1)
  const isCurrentYear = year === new Date().getFullYear()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevYear} className="h-8 px-3 rounded-lg text-xs text-white/40 hover:text-white/60 bg-white/[0.04] border border-white/[0.06]">
          ← {year - 1}
        </button>
        <h2 className="text-lg font-bold text-gradient">{year} Life Report</h2>
        <button onClick={nextYear} disabled={isCurrentYear}
          className="h-8 px-3 rounded-lg text-xs text-white/40 hover:text-white/60 bg-white/[0.04] border border-white/[0.06] disabled:opacity-30"
        >
          {year + 1} →
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-500/10 via-accent-500/5 to-transparent border border-white/[0.08] text-center">
        <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gradient">{report.totalGoals + report.gymSessions + report.journalEntries}</p>
        <p className="text-xs text-white/30">Total Actions Tracked</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {report.stats.map((stat, idx) => {
          const Icon = STAT_ICONS[stat.label] || Activity
          const grad = STAT_COLORS[stat.label] || "from-white/50 to-white/30"
          const bg = STAT_BG[stat.label] || "bg-white/[0.02] border-white/[0.06]"
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedStat(selectedStat === idx ? null : idx)}
              className={cn("p-3 rounded-xl border text-left transition-all", bg)}
            >
              <Icon className={`w-4 h-4 mb-1 bg-gradient-to-br ${grad} bg-clip-text text-transparent`} />
              <p className="text-lg font-bold text-white/80">{stat.value}</p>
              <p className="text-[10px] text-white/30">{stat.label}</p>
              {selectedStat === idx && <p className="text-[9px] text-white/20 mt-1">{stat.subtitle}</p>}
            </motion.button>
          )
        })}
      </div>

      {report.topAchievements.length > 0 && (
        <div className="p-4 rounded-xl bg-success/[0.03] border border-success/10">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-success">Top Achievements</span>
          </div>
          <ul className="space-y-1.5">
            {report.topAchievements.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <Star className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.growthAreas.length > 0 && (
        <div className="p-4 rounded-xl bg-brand-500/[0.03] border border-brand-500/10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-medium text-brand-400">Growth Areas</span>
          </div>
          <ul className="space-y-1.5">
            {report.growthAreas.map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70">{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
        <Quote className="w-4 h-4 text-white/20 mx-auto mb-2" />
        <p className="text-sm italic text-white/50">{'\u201C'}{report.quote}{'\u201D'}</p>
      </div>
    </div>
  )
}
