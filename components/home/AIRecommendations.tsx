"use client"

import { motion } from "framer-motion"
import { Lightbulb, ArrowRight } from "lucide-react"

const recommendations = [
  { text: "Review Physics Chapter 7 — mock test tomorrow", type: "warning" as const },
  { text: "Hydration at 40% — drink 2 glasses now", type: "danger" as const },
  { text: "Gym session pending — upper body today", type: "info" as const },
]

export function AIRecommendations() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <h3 className="section-title text-sm mb-3">AI Recommendations</h3>
      <div className="space-y-2">
        {recommendations.map((rec, idx) => {
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
    </motion.div>
  )
}
