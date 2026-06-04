"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, TrendingDown, Minus, Target, Lightbulb, Zap, ArrowRight } from "lucide-react"
import { generateBriefing, type DailyBriefing } from "@/lib/life-engine"
import { recommendPriorities } from "@/lib/automation-engine"
import Link from "next/link"
import { ROUTES } from "@/lib/routes"

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
    if (dir === "up") return <TrendingUp className="w-4 h-4 text-semantic-success" />
    if (dir === "down") return <TrendingDown className="w-4 h-4 text-semantic-danger" />
    return <Minus className="w-4 h-4 text-text-tertiary" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl glass-tinted p-6 sm:p-8 lg:p-10"
    >

      <div className="relative">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="hero-title mb-1">{briefing.greeting}</h1>
            <p className="text-text-secondary mt-1 max-w-xl">Here&apos;s your current status and what needs attention.</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-sm">
                <DirectionIcon dir={briefing.recovery.direction} />
                <span className="text-text-tertiary">Recovery</span>
                <span className="font-semibold text-text-primary">{briefing.recovery.value}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-sm">
                <DirectionIcon dir={briefing.projectVelocity.direction} />
                <span className="text-text-tertiary">Velocity</span>
                <span className="font-semibold text-text-primary">{briefing.projectVelocity.value}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-sm">
                <DirectionIcon dir={briefing.learningProgress.direction} />
                <span className="text-text-tertiary">Learning</span>
                <span className="font-semibold text-text-primary">{briefing.learningProgress.value}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-brand" />
                  <span className="text-xs font-semibold text-brand uppercase tracking-wider">Recommended Focus</span>
                </div>
                <p className="text-sm text-text-primary font-medium">{briefing.focusOfDay}</p>
              </div>
              {priority && (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Top Priority</span>
                  </div>
                  <p className="text-sm text-text-primary font-medium">{priority}</p>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {briefing.insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>{insight}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href={ROUTES.BRIEFINGS} className="h-9 px-4 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-xs font-medium transition-all flex items-center gap-1.5 group">
                Full Briefing <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href={ROUTES.VOICE} className="h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary text-xs font-medium transition-all flex items-center gap-1.5">
                Voice Command <Zap className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
