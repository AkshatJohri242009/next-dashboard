"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { TimelineEvent } from "@/lib/types"
import { LifeTimeline } from "@/components/life/LifeTimeline"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Clock, Calendar, Star } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function TimelinePageClient() {
  const [stats, setStats] = useState({ total: 0, years: 1, categories: 0 })

  useEffect(() => {
    try {
      const events: TimelineEvent[] = JSON.parse(localStorage.getItem("lifeos_timeline") || "[]")
      const years = new Set(events.map(e => e.date?.slice(0, 4))).size
      const cats = new Set(events.map(e => e.category)).size
      setStats({ total: events.length, years: Math.max(1, years), categories: cats })
    } catch {}
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="page-title">Life Timeline</h1>
        <p className="text-sm text-text-tertiary mt-1">A chronological record of meaningful life events.</p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="card-elevated p-4 text-center">
          <Clock className="w-4 h-4 text-brand mx-auto mb-1" />
          <p className="metric-value text-brand">{stats.total}</p>
          <p className="metric-label">Events</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="metric-value text-accent">{stats.years}</p>
          <p className="metric-label">Years</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <Star className="w-4 h-4 text-warning mx-auto mb-1" />
          <p className="metric-value text-warning">{stats.categories}</p>
          <p className="metric-label">Categories</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="card-elevated p-4 sm:p-6">
        <LifeTimeline />
      </motion.div>
    </motion.div>
  )
}
