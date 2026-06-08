"use client"

import { motion } from "framer-motion"
import { StudyFiles } from "@/components/study/StudyFiles"

export default function StudyFilesPageClient() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold text-gradient">Study Files</h1>
      <p className="text-sm text-text-tertiary">Upload and manage study materials</p>
      <div className="max-w-2xl glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <StudyFiles />
      </div>
    </motion.div>
  )
}
