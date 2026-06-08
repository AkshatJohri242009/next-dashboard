"use client"

import { motion } from "framer-motion"
import { FocusSounds } from "@/components/study/FocusSounds"

export default function StudySoundsPageClient() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold text-gradient">Focus Sounds</h1>
      <p className="text-sm text-text-tertiary">Ambient noise generated in your browser</p>
      <div className="max-w-md glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <FocusSounds />
      </div>
    </motion.div>
  )
}
