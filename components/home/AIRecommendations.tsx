"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Lightbulb, ArrowRight, Loader2 } from "lucide-react"
import { gatherContext, generatePageInsights, type JarvisInsight } from "@/lib/jarvis-context"

type DisplayType = "danger" | "warning" | "accent"
type RecItem = { text: string; type: DisplayType }

function insightToDisplay(insight: JarvisInsight): RecItem {
  const map: Record<string, DisplayType> = { positive: "accent", negative: "danger", action: "warning", neutral: "accent" }
  return { text: insight.message, type: map[insight.type] }
}

export function AIRecommendations() {
  const [items, setItems] = useState<RecItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const ctx = gatherContext("home")
      const insights = generatePageInsights(ctx)
      setItems(insights.slice(0, 3).map(insightToDisplay))
    } catch { setItems([]) }
    setLoading(false)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <h3 className="section-heading mb-3">AI Recommendations</h3>
      {loading ? (
        <div className="flex items-center gap-2 text-white/40 py-4">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Analyzing your data...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-xs text-white/30 py-4 text-center">
          Not enough data yet — track habits, goals, and health to get recommendations
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((rec, idx) => {
            const typeClass = rec.type === "danger" ? "insight-card-danger" : rec.type === "warning" ? "insight-card-warning" : "insight-card-accent"
            return (
              <div key={idx} className={`${typeClass} flex items-center justify-between group cursor-pointer`}>
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" style={{ color: rec.type === "danger" ? "var(--danger)" : rec.type === "warning" ? "var(--warning)" : "var(--accent)" }} />
                  <p className="text-xs text-white/70">{rec.text}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
