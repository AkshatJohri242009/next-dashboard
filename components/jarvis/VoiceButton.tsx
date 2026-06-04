"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, MicOff, X, Volume2, Loader2, HelpCircle } from "lucide-react"
import { startListening, speakText, stopSpeaking, isSpeechSupported, isSynthesisSupported } from "@/lib/voice"
import { processVoiceCommand, getIntentDescriptions } from "@/lib/voice-intents"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function VoiceButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState<{ message: string; success: boolean; action?: string } | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const router = useRouter()

  const supported = isSpeechSupported()

  const handleToggle = useCallback(async () => {
    if (isOpen) {
      setIsOpen(false)
      setResult(null)
      setTranscript("")
      stopSpeaking()
      return
    }
    setIsOpen(true)
    setResult(null)
    setTranscript("")
    setIsListening(true)
    try {
      const text = await startListening(10000)
      setTranscript(text)
      setIsListening(false)
      const cmdResult = await processVoiceCommand(text)
      setResult({ message: cmdResult.message, success: cmdResult.success, action: cmdResult.action })
      if (cmdResult.success && !cmdResult.message.toLowerCase().includes("what goal")) {
        setIsSpeaking(true)
        await speakText(cmdResult.message)
        setIsSpeaking(false)
      }
    } catch (e) {
      setIsListening(false)
      if ((e as Error).message === "Listening timed out") {
        setResult({ message: "I didn't hear anything. Try again?", success: false })
      } else {
        setResult({ message: "Couldn't process voice. Make sure your microphone is enabled.", success: false })
      }
    }
  }, [isOpen])

  const handleAction = useCallback((action?: string) => {
    if (action && action.startsWith("/")) {
      router.push(action)
      setIsOpen(false)
    }
  }, [router])

  if (!supported) return null

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-brand/5 transition-all duration-300",
          isOpen
            ? "bg-danger/20 border border-danger/30 text-danger"
            : "bg-brand/20 border border-brand/30 text-brand hover:bg-brand/30 hover:scale-110"
        )}
        title="Talk to JARVIS"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96"
          >
            <div className="glass-strong rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-brand" />
                  </div>
                  <span className="text-sm font-bold text-gradient">J.A.R.V.I.S</span>
                </div>
                <button onClick={() => setShowHelp(!showHelp)} className="h-8 w-8 rounded flex items-center justify-center text-white/30 hover:text-white/60">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {isListening && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="relative">
                      <MicOff className="w-8 h-8 text-brand-400 animate-pulse" />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-brand-500/20"
                      />
                    </div>
                    <p className="text-sm text-white/50">Listening...</p>
                  </div>
                )}

                {transcript && (
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <p className="text-xs text-white/30 mb-1">You said:</p>
                    <p className="text-sm text-white/80">{transcript}</p>
                  </div>
                )}

                {result && (
                  <div className={cn(
                    "p-3 rounded-xl border",
                    result.success ? "bg-brand-500/10 border-brand-500/20" : "bg-danger/10 border-danger/20"
                  )}>
                    <p className="text-sm text-white/80">{result.message}</p>
                    {result.action && (
                      <button
                        onClick={() => handleAction(result.action)}
                        className="mt-2 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Open → {result.action}
                      </button>
                    )}
                  </div>
                )}

                {isSpeaking && (
                  <div className="flex items-center gap-2 py-2">
                    <Volume2 className="w-4 h-4 text-brand-400 animate-pulse" />
                    <span className="text-xs text-white/40">Speaking...</span>
                  </div>
                )}

                {showHelp && (
                  <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-xl bg-white/[0.02]">
                    <p className="text-xs font-medium text-white/40 mb-2">Try saying:</p>
                    {getIntentDescriptions().slice(0, 15).map((intent) => (
                      <p key={intent.id} className="text-xs text-white/30">
                        <span className="text-white/50 font-medium">{'\u201C'}{intent.example.replace(/[\\"']/g, "")}{'\u201D'}</span>
                      </p>
                    ))}
                  </div>
                )}

                {!isListening && !result && !showHelp && (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <p className="text-sm text-white/40 text-center">Tap the mic to speak, or say &ldquo;help&rdquo; for commands</p>
                  </div>
                )}

                {result && !isSpeaking && (
                  <button
                    onClick={() => { setIsOpen(false); setResult(null); setTranscript("") }}
                    className="w-full h-9 rounded-xl text-xs font-medium text-white/40 hover:text-white/60 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
