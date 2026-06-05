"use client"

import { SettingsPanel } from "@/components/settings/SettingsPanel"
import { JarvisInsightBar } from "@/components/life/JarvisInsightBar"
import { Settings, Sun, Moon, Palette } from "lucide-react"
import { useStore } from "@/lib/store"
import { THEME_PRESETS } from "@/lib/types"
import type { ThemePresetName } from "@/lib/types"

const PRESET_NAMES: ThemePresetName[] = ["claude", "opencode-green", "opencode-github", "vercel-blue", "vercel-geist"]

function ThemeSettingsSection() {
  const { theme, setTheme, applyPreset } = useStore()

  return (
    <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-4 h-4 text-text-tertiary" />
        <span className="section-label">Theme</span>
      </div>

      <div className="mb-4">
        <span className="text-xs text-text-tertiary mb-2 block">Mode</span>
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
      </div>

      <div>
        <span className="text-xs text-text-tertiary mb-3 block">Presets</span>
        <div className="flex flex-wrap gap-3">
          {PRESET_NAMES.map((key) => {
            const preset = THEME_PRESETS[key]
            const colors = theme.mode === "light" ? preset.light : preset.dark
            const isActive = theme.preset === key
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] ${
                  isActive
                    ? "bg-white/[0.08] ring-1 ring-white/20"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
                  style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  <span style={{ color: colors.brand }}>{preset.icon}</span>
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-white/80" : "text-text-tertiary"}`}>
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center">
          <Settings className="w-4 h-4 text-brand" />
        </div>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-text-tertiary">JARVIS configuration & preferences</p>
        </div>
      </div>
      <JarvisInsightBar />
      <ThemeSettingsSection />
      <div className="glass-strong rounded-2xl border border-white/[0.08] p-4 sm:p-6">
        <div className="max-w-lg">
          <SettingsPanel />
        </div>
      </div>
    </div>
  )
}
