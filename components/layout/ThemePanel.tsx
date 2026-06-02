"use client"

import { motion } from "framer-motion"
import { Sun, Moon, Palette } from "lucide-react"
import { useStore } from "@/lib/store"
import { useState } from "react"

const PRESET_COLORS = [
  { brand: "#3bcb85", accent: "#748ffc", label: "Default" },
  { brand: "#6366f1", accent: "#8b5cf6", label: "Indigo" },
  { brand: "#f59e0b", accent: "#f97316", label: "Amber" },
  { brand: "#ec4899", accent: "#f43f5e", label: "Rose" },
  { brand: "#14b8a6", accent: "#06b6d4", label: "Teal" },
  { brand: "#a855f7", accent: "#d946ef", label: "Purple" },
  { brand: "#ef4444", accent: "#f97316", label: "Sunset" },
  { brand: "#0ea5e9", accent: "#38bdf8", label: "Sky" },
]

export function ThemePanel() {
  const { theme, setTheme } = useStore()
  const [customBrand, setCustomBrand] = useState(theme.brandColor)
  const [customAccent, setCustomAccent] = useState(theme.accentColor)

  const apply = (brand: string, accent: string) => {
    setCustomBrand(brand)
    setCustomAccent(accent)
    setTheme({ ...theme, brandColor: brand, accentColor: accent })
  }

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const rgbToHex = (r: number, g: number, b: number) =>
    "#" + [r, g, b].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("")

  const handleBrandR = (val: number) => {
    const rgb = hexToRgb(customBrand)
    apply(rgbToHex(val, rgb.g, rgb.b), customAccent)
  }
  const handleBrandG = (val: number) => {
    const rgb = hexToRgb(customBrand)
    apply(rgbToHex(rgb.r, val, rgb.b), customAccent)
  }
  const handleBrandB = (val: number) => {
    const rgb = hexToRgb(customBrand)
    apply(rgbToHex(rgb.r, rgb.g, val), customAccent)
  }
  const handleAccentR = (val: number) => {
    const rgb = hexToRgb(customAccent)
    apply(customBrand, rgbToHex(val, rgb.g, rgb.b))
  }
  const handleAccentG = (val: number) => {
    const rgb = hexToRgb(customAccent)
    apply(customBrand, rgbToHex(rgb.r, val, rgb.b))
  }
  const handleAccentB = (val: number) => {
    const rgb = hexToRgb(customAccent)
    apply(customBrand, rgbToHex(rgb.r, rgb.g, val))
  }

  const brandRgb = hexToRgb(customBrand)
  const accentRgb = hexToRgb(customAccent)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full right-0 mt-2 w-[320px] z-50"
    >
      <div className="bg-[#050506] rounded-2xl p-5 space-y-4 border border-white/[0.08] shadow-2xl">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-white/50" />
          <span className="text-xs font-bold font-mono tracking-widest text-white/30 uppercase">Theme</span>
        </div>

        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase block mb-2">Mode</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme({ ...theme, mode: "dark" })}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                theme.mode === "dark"
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              onClick={() => setTheme({ ...theme, mode: "light" })}
              className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                theme.mode === "light"
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase block mb-2">
            Presets
          </span>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map(p => (
              <button
                key={p.label}
                onClick={() => apply(p.brand, p.accent)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.brand }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="text-[9px] text-white/30 font-mono">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase block mb-2">
            Brand Color
          </span>
          <div className="space-y-1.5">
            {["R", "G", "B"].map((channel, i) => {
              const val = [brandRgb.r, brandRgb.g, brandRgb.b][i]
              const handler = [handleBrandR, handleBrandG, handleBrandB][i]
              return (
                <div key={channel} className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-white/40 w-4">{channel}</span>
                  <input
                    type="range"
                    min={0} max={255}
                    value={val}
                    onChange={e => handler(parseInt(e.target.value))}
                    className="flex-1 h-7 rounded-full appearance-none bg-white/[0.1] accent-brand-400 cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.4)]
                      [&::-webkit-slider-track]:h-full [&::-webkit-slider-track]:rounded-full"
                  />
                  <span className="text-[11px] font-mono text-white/50 w-8 text-right tabular-nums">{val}</span>
                </div>
              )
            })}
            <input
              type="color"
              value={customBrand}
              onChange={e => apply(e.target.value, customAccent)}
              className="w-full h-9 rounded-xl cursor-pointer bg-transparent border border-white/[0.1] p-0.5"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-white/30 uppercase block mb-2">
            Accent Color
          </span>
          <div className="space-y-1.5">
            {["R", "G", "B"].map((channel, i) => {
              const val = [accentRgb.r, accentRgb.g, accentRgb.b][i]
              const handler = [handleAccentR, handleAccentG, handleAccentB][i]
              return (
                <div key={channel} className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-white/40 w-4">{channel}</span>
                  <input
                    type="range"
                    min={0} max={255}
                    value={val}
                    onChange={e => handler(parseInt(e.target.value))}
                    className="flex-1 h-7 rounded-full appearance-none bg-white/[0.1] accent-brand-400 cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.4)]
                      [&::-webkit-slider-track]:h-full [&::-webkit-slider-track]:rounded-full"
                  />
                  <span className="text-[11px] font-mono text-white/50 w-8 text-right tabular-nums">{val}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
