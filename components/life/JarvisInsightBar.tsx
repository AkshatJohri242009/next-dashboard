"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, X, Sparkles } from "lucide-react"
import { gatherContext, generatePageInsights, type JarvisInsight } from "@/lib/jarvis-context"
import { usePathname } from "next/navigation"

const iconMap: Record<string, typeof Lightbulb> = {
  positive: TrendingUp,
  negative: TrendingDown,
  action: Lightbulb,
  neutral: Sparkles,
}

const colorMap: Record<string, string> = {
  positive: "var(--success)",
  negative: "var(--danger)",
  action: "var(--accent)",
  neutral: "var(--text-tertiary)",
}

export function JarvisInsightBar() {
  const pathname = usePathname()
  const [insights, setInsights] = useState<JarvisInsight[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const page = pathname.split("/")[1] || "home"

  useEffect(() => {
    const ctx = gatherContext(page)
    const generated = generatePageInsights(ctx)
    setInsights(generated)
  }, [page])

  if (insights.length === 0) return null

  const visible = insights.filter(i => !dismissed.has(i.message))

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-2 text-xs text-text-tertiary font-medium mb-1">
        <Brain className="w-3.5 h-3.5" />
        JARVIS Insights
      </div>
      <AnimatePresence>
        {visible.map((insight) => {
          const Icon = iconMap[insight.type]
          return (
            <motion.div
              key={insight.message}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="insight-card flex items-start gap-2.5 pr-2"
              style={{ borderLeftColor: colorMap[insight.type] }}
            >
              <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: colorMap[insight.type] }} />
              <p className="text-xs text-text-secondary flex-1">{insight.message}</p>
              <button onClick={() => setDismissed(new Set([...dismissed, insight.message]))}
                className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3 text-text-tertiary" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
