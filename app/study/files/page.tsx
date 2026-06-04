"use client"

import { motion } from "framer-motion"
import { StudyFiles } from "@/components/study/StudyFiles"

export default function StudyFilesPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary">Study Files</h1>
        <p className="text-sm text-text-tertiary mt-1">Upload and manage study materials</p>
      </div>

      <div className="max-w-2xl">
        <StudyFiles />
      </div>
    </motion.div>
  )
}
