"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { KnowledgeGraph } from "@/components/life/KnowledgeGraph"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Brain, Zap, Link2 } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function BrainPageClient() {
  const [stats, setStats] = useState({ total: 0, connections: 0 })

  useEffect(() => {
    try {
      const ideas = JSON.parse(localStorage.getItem("lifeos_brain") || "[]")
      const totalConnections = ideas.reduce((a: number, i: { connections?: string[] }) => a + (i.connections?.length || 0), 0)
      setStats({ total: ideas.length, connections: totalConnections })
    } catch {}
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Second Brain</h1>
        <p className="text-sm text-white/40 mt-1">Connected ideas, notes, and concepts — your personal knowledge graph.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card-elevated p-4 text-center">
          <Brain className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="metric-value text-accent">{stats.total}</p>
          <p className="metric-label">Ideas</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Link2 className="w-4 h-4 text-brand mx-auto mb-1" />
          <p className="metric-value text-brand">{stats.connections}</p>
          <p className="metric-label">Connections</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Zap className="w-4 h-4 text-warning mx-auto mb-1" />
          <p className="metric-value text-warning">{stats.total > 0 ? Math.round(stats.connections / stats.total) : 0}</p>
          <p className="metric-label">Avg Links/Idea</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <KnowledgeGraph />
      </motion.div>
    </motion.div>
  )
}
