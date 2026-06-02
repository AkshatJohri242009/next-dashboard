"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, TrendingDown, Minus, Target, Lightbulb, Zap, ArrowRight } from "lucide-react"
import { generateBriefing, type DailyBriefing } from "@/lib/life-engine"
import { recommendPriorities } from "@/lib/automation-engine"
import Link from "next/link"

export function AIBriefing() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [priority, setPriority] = useState("")

  useEffect(() => {
    setBriefing(generateBriefing())
    try {
      const result = recommendPriorities()
      if (result.success && result.data?.recommendations?.[0]) {
        setPriority(result.data.recommendations[0])
      }
    } catch {}
  }, [])

  if (!briefing) return null

  const DirectionIcon = ({ dir }: { dir: string }) => {
    if (dir === "up") return <TrendingUp className="w-3.5 h-3.5 text-green-400" />
    if (dir === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-400" />
    return <Minus className="w-3.5 h-3.5 text-white/40" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-brand/[0.04] via-transparent to-accent/[0.02] p-6 sm:p-8"
    >
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand/10 to-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-accent/5 to-transparent blur-[80px] pointer-events-none" />

      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-accent-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-1 leading-tight">{briefing.greeting}</h1>
            <p className="text-sm sm:text-base text-white/40 mt-1">Here&apos;s your current status and what needs attention.</p>

            <div className="flex flex-wrap gap-2 mt-5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-xs">
                <DirectionIcon dir={briefing.recovery.direction} />
                <span className="text-white/50">Recovery</span>
                <span className="font-semibold text-white/80">{briefing.recovery.value}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-xs">
                <DirectionIcon dir={briefing.projectVelocity.direction} />
                <span className="text-white/50">Velocity</span>
                <span className="font-semibold text-white/80">{briefing.projectVelocity.value}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-xs">
                <DirectionIcon dir={briefing.learningProgress.direction} />
                <span className="text-white/50">Learning</span>
                <span className="font-semibold text-white/80">{briefing.learningProgress.value}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-brand" />
                  <span className="text-[10px] font-semibold text-brand uppercase tracking-wider">Recommended Focus</span>
                </div>
                <p className="text-sm text-white/80 font-medium">{briefing.focusOfDay}</p>
              </div>
              {priority && (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Top Priority</span>
                  </div>
                  <p className="text-sm text-white/80 font-medium">{priority}</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {briefing.insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-white/50">
                  <Lightbulb className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                  <p>{insight}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/briefings" className="h-9 px-4 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-xs font-medium transition-all flex items-center gap-1.5">
                Full Briefing <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href="/voice" className="h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-xs font-medium transition-all flex items-center gap-1.5">
                Voice Command <Zap className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
