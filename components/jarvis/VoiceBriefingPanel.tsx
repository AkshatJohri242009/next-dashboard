"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Sun, Moon, Calendar, TrendingUp, TrendingDown, Minus, Volume2,
  Sparkles, Flame, Dumbbell, Brain, Activity,
} from "lucide-react"
import { generateMorningBriefing, generateEveningReview, generateWeeklyBriefing, generateMonthlyBriefing, generateBriefingVoiceText, type DailyBriefing, type WeeklyBriefing, type MonthlyBriefing } from "@/lib/voice-briefings"
import { speakText, stopSpeaking } from "@/lib/voice"
import { cn } from "@/lib/utils"

type BriefingType = "morning" | "evening" | "weekly" | "monthly"

const ICON_MAP: Record<string, any> = {
  "🎯": Sparkles,
  "🌙": Moon,
  "🔥": Flame,
  "💪": Dumbbell,
  "🧬": Activity,
  "⚡": Sparkles,
  "📝": Brain,
  "🌟": Sparkles,
  "💭": Brain,
  "✅": Sparkles,
}

export function VoiceBriefingPanel() {
  const [type, setType] = useState<BriefingType>("morning")
  const [autoPlay, setAutoPlay] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})

  const morning = useMemo(() => generateMorningBriefing(), [])
  const evening = useMemo(() => generateEveningReview(), [])
  const weekly = useMemo(() => generateWeeklyBriefing(), [])
  const monthly = useMemo(() => generateMonthlyBriefing(), [])

  const briefings = { morning, evening, weekly, monthly }

  const toggleSection = (idx: number) => {
    setShowDetails(prev => ({ ...prev, [String(idx)]: !prev[String(idx)] }))
  }

  const handleSpeak = async () => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); return }
    setIsSpeaking(true)
    if (type === "morning" || type === "evening") {
      const briefing = briefings[type] as DailyBriefing
      await speakText(generateBriefingVoiceText(briefing))
    } else {
      const briefing = briefings[type] as WeeklyBriefing | MonthlyBriefing
      const text = "weekLabel" in briefing
        ? `Weekly Review. ${(briefing as WeeklyBriefing).weekLabel}. Score: ${(briefing as WeeklyBriefing).score}. Achievements: ${(briefing as WeeklyBriefing).achievements.join(", ")}. Recommendations: ${(briefing as WeeklyBriefing).recommendations.join(", ")}`
        : `Monthly Review. ${(briefing as MonthlyBriefing).monthLabel}. Score: ${(briefing as MonthlyBriefing).overallScore}. Growth: ${(briefing as MonthlyBriefing).growthAreas.join(", ")}`
      await speakText(text)
    }
    setIsSpeaking(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {(["morning", "evening", "weekly", "monthly"] as BriefingType[]).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={cn(
                "px-3 h-8 rounded-lg text-xs font-medium transition-all",
                type === t ? "bg-brand-500/20 text-brand-400 border border-brand-500/30" : "text-white/40 hover:text-white/60"
              )}
            >
              {t === "morning" && <><Sun className="w-3.5 h-3.5 inline mr-1" />Morning</>}
              {t === "evening" && <><Moon className="w-3.5 h-3.5 inline mr-1" />Evening</>}
              {t === "weekly" && <><Calendar className="w-3.5 h-3.5 inline mr-1" />Weekly</>}
              {t === "monthly" && <><Activity className="w-3.5 h-3.5 inline mr-1" />Monthly</>}
            </button>
          ))}
        </div>
        <button onClick={handleSpeak}
          className={cn(
            "h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
            isSpeaking ? "bg-danger/20 text-danger border border-danger/30" : "bg-white/[0.04] text-white/50 hover:text-white/70 border border-white/[0.06]"
          )}
        >
          {isSpeaking ? <><Volume2 className="w-3.5 h-3.5 animate-pulse" />Stop</> : <><Volume2 className="w-3.5 h-3.5" />Speak</>}
        </button>
      </div>

      {(type === "morning" || type === "evening") && (() => {
        const briefing = briefings[type] as DailyBriefing
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-accent-500/5 border border-white/[0.06]">
              <h2 className="text-lg font-bold text-gradient">{briefing.greeting}</h2>
              <p className="text-xs text-white/30 mt-1">{briefing.date}</p>
            </div>
            {briefing.sections.map((section, idx) => {
              const Icon = ICON_MAP[section.icon] || Sparkles
              const isOpen = showDetails[String(idx)] !== false
              return (
                <div key={idx} className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <button onClick={() => toggleSection(idx)} className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors">
                    <Icon className="w-4 h-4 shrink-0 text-white/50" />
                    <span className="text-sm font-medium text-white/70">{section.title}</span>
                    <span className={cn(
                      "ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full",
                      section.type === "positive" ? "bg-success/10 text-success" :
                      section.type === "negative" ? "bg-danger/10 text-danger" :
                      section.type === "action" ? "bg-warning/10 text-warning" :
                      "bg-white/[0.04] text-white/40"
                    )}>
                      {section.type}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-1">
                      {section.items.filter(Boolean).map((item, i) => (
                        <p key={i} className="text-sm text-white/60">{item}</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <p className="text-xs text-white/30 italic">{briefing.summary}</p>
          </div>
        )
      })()}

      {type === "weekly" && (() => {
        const briefing = weekly
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-accent-500/5 border border-white/[0.06] text-center">
              <p className="text-xs text-white/30">{briefing.weekLabel}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-gradient">{briefing.score}</span>
                <span className="text-xs text-white/40">/100</span>
                {briefing.momentum === "up" && <TrendingUp className="w-5 h-5 text-success" />}
                {briefing.momentum === "down" && <TrendingDown className="w-5 h-5 text-danger" />}
                {briefing.momentum === "stable" && <Minus className="w-5 h-5 text-white/40" />}
              </div>
            </div>
            {briefing.achievements.length > 0 && (
              <div className="p-3 rounded-xl bg-success/[0.03] border border-success/10">
                <p className="text-xs font-medium text-success mb-2">✓ Achievements</p>
                <ul className="space-y-1">
                  {briefing.achievements.map((a, i) => <li key={i} className="text-sm text-white/60">• {a}</li>)}
                </ul>
              </div>
            )}
            {briefing.missedTargets.length > 0 && (
              <div className="p-3 rounded-xl bg-danger/[0.03] border border-danger/10">
                <p className="text-xs font-medium text-danger mb-2">✗ Missed Targets</p>
                <ul className="space-y-1">
                  {briefing.missedTargets.map((m, i) => <li key={i} className="text-sm text-white/60">• {m}</li>)}
                </ul>
              </div>
            )}
            <div className="p-3 rounded-xl bg-warning/[0.03] border border-warning/10">
              <p className="text-xs font-medium text-warning mb-2">→ Recommendations</p>
              <ul className="space-y-1">
                {briefing.recommendations.map((r, i) => <li key={i} className="text-sm text-white/60">• {r}</li>)}
              </ul>
            </div>
          </div>
        )
      })()}

      {type === "monthly" && (() => {
        const briefing = monthly
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-brand-500/5 to-accent-500/5 border border-white/[0.06] text-center">
              <p className="text-xs text-white/30">{briefing.monthLabel}</p>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gradient">{briefing.overallScore}</span>
                <span className="text-xs text-white/40 ml-1">/100 overall</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-brand-500/[0.03] border border-brand-500/10">
              <p className="text-xs font-medium text-brand-400 mb-2">Growth Areas</p>
              <ul className="space-y-1">
                {briefing.growthAreas.map((g, i) => <li key={i} className="text-sm text-white/60">• {g}</li>)}
              </ul>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.06]">
              <p className="text-xs font-medium text-white/40 mb-2">Trends</p>
              <ul className="space-y-1">
                {briefing.trends.map((t, i) => <li key={i} className="text-sm text-white/60">• {t}</li>)}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-warning/[0.03] border border-warning/10">
              <p className="text-xs font-medium text-warning mb-2">Projections</p>
              <ul className="space-y-1">
                {briefing.projections.map((p, i) => <li key={i} className="text-sm text-white/60">• {p}</li>)}
              </ul>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
