"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Brain, Dumbbell, Calendar, BookOpen, FileText, Target, Sparkles, CheckCircle2 } from "lucide-react"
import { getAutomations, type AutomationResult } from "@/lib/automation-engine"

const actionIcons: Record<string, typeof Brain> = {
  plan: BookOpen,
  schedule: Calendar,
  generate: Sparkles,
  organize: FileText,
  recommend: Brain,
}

export function AutomationPanel() {
  const [results, setResults] = useState<Record<string, AutomationResult | null>>({})
  const [running, setRunning] = useState<string | null>(null)
  const automations = getAutomations()

  const run = async (id: string) => {
    setRunning(id)
    const automation = automations.find(a => a.id === id)
    if (!automation) return
    try {
      const result = await Promise.resolve(automation.execute())
      setResults(r => ({ ...r, [id]: result }))
    } catch {
      setResults(r => ({ ...r, [id]: { success: false, message: "Automation failed" } }))
    }
    setRunning(null)
  }

  return (
    <div className="space-y-3">
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

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-2 p-2.5 rounded-lg text-xs ${result.success ? "bg-brand/10 text-brand-300" : "bg-danger/10 text-danger"}`}>
                        {result.message}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => run(auto.id)}
                  disabled={isRunning}
                  className="mt-2 h-7 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 disabled:bg-white/5 text-accent text-[10px] font-medium transition-all flex items-center gap-1.5 disabled:opacity-30"
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
