"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX, Wind, Cloud, Waves, Droplets } from "lucide-react"
import { playWhiteNoise, playPinkNoise, playBrownNoise, playRain, stopAllSounds, setMasterVolume } from "@/lib/sounds"

const sounds: { id: string; label: string; icon: any; color: string; play: () => (() => void) | null }[] = [
  { id: "white", label: "White Noise", icon: Wind, color: "text-blue-400", play: playWhiteNoise },
  { id: "pink", label: "Pink Noise", icon: Cloud, color: "text-purple-400", play: playPinkNoise },
  { id: "brown", label: "Brown Noise", icon: Waves, color: "text-amber-400", play: playBrownNoise },
  { id: "rain", label: "Rain", icon: Droplets, color: "text-cyan-400", play: playRain },
]

export function FocusSounds() {
  const [active, setActive] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [stopFn, setStopFn] = useState<(() => void) | null>(null)

  const toggle = useCallback((id: string, play: () => (() => void) | null) => {
    if (active === id) {
      stopFn?.()
      setActive(null)
      setStopFn(null)
    } else {
      stopFn?.()
      const s = play()
      if (s) {
        setActive(id)
        setStopFn(s)
      }
    }
  }, [active, stopFn])

  useEffect(() => {
    setMasterVolume(muted ? 0 : volume)
  }, [volume, muted])

  useEffect(() => {
    return () => { stopFn?.() }
  }, [stopFn])

  useEffect(() => {
    return () => { stopAllSounds() }
  }, [])

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="section-label">
          Focus Sounds
        </span>
        <button
          onClick={() => setMuted(!muted)}
          className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sounds.map((s) => {
          const isActive = active === s.id
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id, s.play)}
              className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl border hover:scale-[1.02] active:scale-[0.98] transition-all ${
                isActive
                  ? "bg-brand-500/10 border-brand-500/30"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <s.icon className={`w-6 h-6 ${isActive ? s.color : "text-white/30"}`} />
              <span className={`text-xs font-bold ${isActive ? "text-white/80" : "text-white/40"}`}>
                {s.label}
              </span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(107,227,164,0.6)]"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <Volume2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={muted ? 0 : volume}
          onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false) }}
          className="flex-1 h-2 rounded-full appearance-none bg-white/[0.08] accent-brand-400 cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-400
            [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(107,227,164,0.8)]
            [&::-webkit-slider-track]:h-full [&::-webkit-slider-track]:rounded-full"
        />
        <span className="text-[11px] font-mono text-white/30 w-8 text-right tabular-nums">
          {Math.round((muted ? 0 : volume) * 100)}
        </span>
      </div>
    </div>
  )
}
