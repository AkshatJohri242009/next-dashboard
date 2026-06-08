"use client"

import { motion } from "framer-motion"
import { Palette } from "lucide-react"
import { ThemeModeToggle, ThemePresetGrid } from "./ThemePresetGrid"

export function ThemePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full right-0 mt-2 w-[320px] z-50"
    >
      <div className="glass-elevated p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-text-tertiary" />
          <span className="section-label">Theme</span>
        </div>

        <div>
          <span className="section-label block mb-2">Mode</span>
          <ThemeModeToggle />
        </div>

        <div>
          <span className="section-label block mb-3">Presets</span>
          <ThemePresetGrid />
        </div>
      </div>
    </motion.div>
  )
}