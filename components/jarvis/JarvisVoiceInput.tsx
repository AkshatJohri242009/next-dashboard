"use client"

import { useState, useRef, useCallback } from "react"
import { Mic, MicOff } from "lucide-react"
import { isSpeechSupported, startListeningInterim } from "@/lib/voice"

interface JarvisVoiceInputProps {
  onTranscript: (text: string) => void
  onInterim?: (text: string) => void
  disabled?: boolean
}

export default function JarvisVoiceInput({ onTranscript, onInterim, disabled }: JarvisVoiceInputProps) {
  const [listening, setListening] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)

  const supported = isSpeechSupported()
  const lang = typeof window !== "undefined"
    ? localStorage.getItem("lifeos-jarvis-lang") || "en-US"
    : "en-US"
  const continuous = typeof window !== "undefined"
    ? localStorage.getItem("lifeos-jarvis-continuous") === "true"
    : false

  const toggle = useCallback(() => {
    if (listening) {
      stopRef.current?.()
      stopRef.current = null
      setListening(false)
      return
    }
    setListening(true)
    const stop = startListeningInterim(
      (text) => { onInterim?.(text) },
      (final) => {
        setListening(false)
        if (final) onTranscript(final)
      },
      () => { setListening(false) },
      lang,
      continuous,
    )
    stopRef.current = stop
  }, [listening, onTranscript, onInterim, lang, continuous])

  if (!supported) {
    return (
      <div className="relative group">
        <button disabled className="p-1.5 rounded-lg text-text-tertiary opacity-40 cursor-not-allowed">
          <MicOff size={16} />
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded-lg glass text-[10px] text-text-tertiary pointer-events-none">
          Voice input requires Chrome or Edge
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      className={`relative p-1.5 rounded-lg transition-all flex-shrink-0 ${
        listening
          ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20"
          : "text-text-tertiary hover:text-text-secondary hover:bg-white/10"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
      title={listening ? "Stop listening" : "Voice input"}
    >
      {listening ? (
        <>
          <Mic size={16} className="relative z-10" />
          <span className="absolute inset-0 rounded-lg animate-ping bg-red-500/20" />
        </>
      ) : (
        <Mic size={16} />
      )}
    </button>
  )
}
