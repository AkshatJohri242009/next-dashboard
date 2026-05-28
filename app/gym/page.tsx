"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { WorkoutLog } from "@/components/gym/WorkoutLog"
import { StrengthChart } from "@/components/gym/StrengthChart"
import { ProgressPhotos } from "@/components/gym/ProgressPhotos"
import { GymCalendar } from "@/components/gym/GymCalendar"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { useStore } from "@/lib/store"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function GymPage() {
  const loadGym = useStore(s => s.loadGym)

  useEffect(() => { loadGym() }, [loadGym])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Gym Tracker</h1>
        <p className="text-sm text-white/40 mt-1">
          Log lifts, track split context, get progressive overload nudges, and compare progress photos.
        </p>
      </div>

      <motion.div variants={item}>
        <GlassPanel variant="strong" glow="accent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-accent-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Workout Log</span>
          </div>
          <WorkoutLog />
        </GlassPanel>
      </motion.div>

      <motion.div variants={item}>
        <GlassPanel variant="strong" glow="green">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-brand-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Consistency Calendar</span>
          </div>
          <GymCalendar />
        </GlassPanel>
      </motion.div>

      <motion.div variants={item}>
        <GlassPanel variant="strong" glow="green">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-brand-400" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Strength Trends</span>
          </div>
          <StrengthChart />
        </GlassPanel>
      </motion.div>

      <motion.div variants={item}>
        <GlassPanel variant="strong">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-4 rounded-full bg-white/30" />
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase">Progress Photos</span>
          </div>
          <ProgressPhotos />
        </GlassPanel>
      </motion.div>
    </motion.div>
  )
}
