"use client"

import { motion } from "framer-motion"
import { Sun, Moon, Palette } from "lucide-react"
import { useStore } from "@/lib/store"
import { THEME_PRESETS } from "@/lib/types"
import type { ThemePresetName } from "@/lib/types"

const PRESET_NAMES: ThemePresetName[] = ["claude", "opencode-green", "opencode-github", "vercel-blue", "vercel-geist"]

export function ThemePanel() {
  const { theme, setTheme, applyPreset } = useStore()

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
          <div className="flex gap-2">
            <button
              onClick={() => setTheme({ ...theme, mode: "dark" })}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                theme.mode === "dark"
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "bg-white/[0.03] text-text-tertiary hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => setTheme({ ...theme, mode: "light" })}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                theme.mode === "light"
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "bg-white/[0.03] text-text-tertiary hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
          </div>
        </div>

        <div>
          <span className="section-label block mb-3">Presets</span>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_NAMES.map((key) => {
              const preset = THEME_PRESETS[key]
              const colors = theme.mode === "light" ? preset.light : preset.dark
              const isActive = theme.preset === key
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/[0.08] ring-1 ring-white/20"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    <span style={{ color: colors.brand }}>{preset.icon}</span>
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-white/80" : "text-text-tertiary"}`}>
                    {preset.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}