"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { SupplementScheduler } from "@/components/health/SupplementScheduler"
import { WaterTracker } from "@/components/health/WaterTracker"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { useStore } from "@/lib/store"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function HealthPage() {
  const loadHealth = useStore(s => s.loadHealth)

  useEffect(() => { loadHealth() }, [loadHealth])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Health & Hydration</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Supplement timing, running-low flags, and a dynamic water target that reacts to your day.
        </p>
      </div>

      <JarvisInsightBar />

      <motion.div variants={item}>
        <GlassPanel variant="strong" glow="brand">
          <div className="section-bar">
            <span className="section-label">Supplement Windows</span>
          </div>
          <SupplementScheduler />
        </GlassPanel>
      </motion.div>

      <motion.div variants={item}>
        <GlassPanel variant="strong" glow="accent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-accent-400 shrink-0" />
            <span className="section-label">Fluid Intake Calculator</span>
          </div>
          <WaterTracker />
        </GlassPanel>
      </motion.div>
    </motion.div>
  )
}
