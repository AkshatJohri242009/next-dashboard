"use client"

import { Sun, Moon } from "lucide-react"
import { useStore } from "@/lib/store"
import { THEME_PRESETS } from "@/lib/types"
import type { ThemePresetName } from "@/lib/types"

const PRESET_NAMES: ThemePresetName[] = ["claude", "opencode-green", "opencode-github", "vercel-blue", "vercel-geist"]

export function ThemeModeToggle() {
  const { theme, setTheme } = useStore()
  return (
    <div className="flex gap-2 max-w-xs">
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
  )
}

export function ThemePresetGrid() {
  const { theme, applyPreset } = useStore()
  return (
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
  )
}
