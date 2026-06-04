"use client"

import { motion } from "framer-motion"
import { ProjectTracker } from "@/components/projects/ProjectTracker"
import { GlassPanel } from "@/components/ui/GlassPanel"

export default function ProjectsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <GlassPanel variant="strong" glow="accent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-4 rounded-full bg-accent-400" />
          <span className="section-label">GitHub Projects</span>
        </div>
        <ProjectTracker />
      </GlassPanel>
    </motion.div>
  )
}
