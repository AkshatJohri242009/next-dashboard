"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Brain, Dumbbell, Calendar, BookOpen, FileText, Target, Sparkles, Play, Clock, Coffee, Lightbulb, AlertTriangle } from "lucide-react"
import { getAutomations, type AutomationResult } from "@/lib/automation-engine"

const actionIcons: Record<string, typeof Brain> = {
  plan: BookOpen,
  schedule: Calendar,
  generate: Sparkles,
  organize: FileText,
  recommend: Brain,
}

const subjectColors: Record<string, string> = {
  Physics: "var(--accent)",
  Chemistry: "var(--success)",
  Mathematics: "var(--brand)",
  "Computer Science": "var(--info)",
}

function StudyPlanResult({ data }: { data: any }) {
  if (!data || !data.schedule) return null
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
        <Target className="w-3.5 h-3.5 text-brand" />
        Focus: {data.focus}
        <span className="text-white/30">·</span>
        <Clock className="w-3 h-3 text-white/30" />
        <span className="text-white/50">{data.totalStudyTime}</span>
      </div>
      <div className="space-y-2">
        {data.schedule.map((block: any, i: number) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono text-white/40">{block.time}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${subjectColors[block.subject] || "var(--brand)"}20`, color: subjectColors[block.subject] || "var(--brand)" }}>
                {block.subject}
              </span>
            </div>
            <p className="text-xs font-medium text-white/80">{block.topic}</p>
            <p className="text-xs text-white/40 mt-0.5">{block.task}</p>
            <span className="text-xs text-white/20 mt-1 block capitalize">{block.type}</span>
          </div>
        ))}
      </div>
      {data.breaks && data.breaks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.breaks.map((b: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <Coffee className="w-3 h-3 text-white/30" />
              <span className="text-[11px] text-white/40">{b.time}</span>
              <span className="text-[11px] text-white/30">{b.activity}</span>
            </div>
          ))}
        </div>
      )}
      {data.weakAreas && data.weakAreas.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <AlertTriangle className="w-3 h-3 text-danger" />
          <span className="text-[11px] text-danger font-medium">Weak areas:</span>
          {data.weakAreas.map((w: string, i: number) => (
            <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-danger/10 text-danger">{w}</span>
          ))}
        </div>
      )}
      {data.tips && data.tips.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3 text-warning" />
            <span className="text-[11px] text-warning font-medium">Tips</span>
          </div>
          {data.tips.map((t: string, i: number) => (
            <p key={i} className="text-xs text-white/40 ml-5">• {t}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export function AutomationPanel() {
  const [results, setResults] = useState<Record<string, AutomationResult | null>>({})
  const [running, setRunning] = useState<string | null>(null)
  const [runningAll, setRunningAll] = useState(false)
  const automations = getAutomations()

  const run = useCallback(async (id: string) => {
    setRunning(id)
    const automation = automations.find(a => a.id === id)
    if (!automation) { setRunning(null); return }
    try {
      const result = await Promise.resolve(automation.execute())
      setResults(r => ({ ...r, [id]: result }))
    } catch {
      setResults(r => ({ ...r, [id]: { success: false, message: "Automation failed" } }))
    }
    setRunning(null)
  }, [automations])

  const runAll = useCallback(async () => {
    setRunningAll(true)
    for (const auto of automations) {
      setRunning(auto.id)
      try {
        const result = await Promise.resolve(auto.execute())
        setResults(r => ({ ...r, [auto.id]: result }))
      } catch {
        setResults(r => ({ ...r, [auto.id]: { success: false, message: "Automation failed" } }))
      }
    }
    setRunning(null)
    setRunningAll(false)
  }, [automations])

  const hasResults = Object.values(results).some(r => r !== null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="section-heading">Automations</h3>
        <button
          onClick={runAll}
          disabled={runningAll}
          className="h-8 px-4 rounded-lg bg-brand/20 hover:bg-brand/30 disabled:bg-white/5 text-brand text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-30"
        >
          {runningAll ? (
            <Zap className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {runningAll ? "Running All..." : "Run All"}
        </button>
      </div>

      {automations.map((auto, i) => {
        const Icon = actionIcons[auto.type] || Zap
        const result = results[auto.id]
        const isRunning = running === auto.id
        return (
          <motion.div
            key={auto.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-elevated p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white/80">{auto.name}</h4>
                <p className="text-xs text-white/40 mt-0.5">{auto.description}</p>

                <AnimatePresence mode="wait">
                  {result && (
                    <motion.div
                      key={auto.id + "-result"}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {result.data?.schedule ? (
                        <StudyPlanResult data={result.data} />
                      ) : (
                        <div className={`mt-2 p-2.5 rounded-lg text-xs ${result.success ? "bg-brand/10 text-brand-300" : "bg-danger/10 text-danger"}`}>
                          {result.message.split("\n").map((line, li) => (
                            <div key={li} className={li > 0 ? "mt-0.5" : ""}>{line || "\u00A0"}</div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => run(auto.id)}
                  disabled={isRunning}
                  className="mt-2 h-7 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 disabled:bg-white/5 text-accent text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-30"
                >
                  {isRunning ? (
                    <Zap className="w-3 h-3 animate-pulse" />
                  ) : (
                    <Target className="w-3 h-3" />
                  )}
                  {isRunning ? "Running..." : "Run"}
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
