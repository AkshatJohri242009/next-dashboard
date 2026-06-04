"use client"

import { motion } from "framer-motion"
import { WeightTracker } from "@/components/weight/WeightTracker"
import { GlassPanel } from "@/components/ui/GlassPanel"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function WeightPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Weight Tracker</h1>
        <p className="text-sm text-white/40 mt-1">
          Log your weight daily and track trends over time.
        </p>
      </div>

      <motion.div variants={item}>
        <GlassPanel variant="strong" glow="green">
          <div className="section-bar">
            <span className="section-label">Weight Log</span>
          </div>
          <WeightTracker />
        </GlassPanel>
      </motion.div>
    </motion.div>
  )
}
