"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DecisionLog } from "@/components/life/DecisionLog"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { GitBranch, ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<any[]>([])
  useEffect(() => {
    try { setDecisions(JSON.parse(localStorage.getItem("lifeos_decisions") || "[]")) }
    catch {}
  }, [])

  const total = decisions.length
  const positive = decisions.filter(d => d.outcome === "positive").length
  const negative = decisions.filter(d => d.outcome === "negative").length
  const successRate = total > 0 ? Math.round((positive / total) * 100) : 0

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Decision Log</h1>
        <p className="text-sm text-text-tertiary mt-1">Track major life choices, reflect on outcomes, improve your judgment.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-accent">{total}</p>
          <p className="metric-label">Total Decisions</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-success">{positive}</p>
          <p className="metric-label"><ThumbsUp className="w-3 h-3 inline" /> Positive</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value text-danger">{negative}</p>
          <p className="metric-label"><ThumbsDown className="w-3 h-3 inline" /> Negative</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="metric-value" style={{ color: successRate >= 60 ? "var(--success)" : "var(--warning)" }}>
            {successRate}%
          </p>
          <p className="metric-label">Success Rate</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <DecisionLog />
      </motion.div>
    </motion.div>
  )
}
