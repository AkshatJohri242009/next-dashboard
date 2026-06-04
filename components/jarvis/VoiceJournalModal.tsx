"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mic, Sparkles, Loader2, CheckCircle2, X, Tag, Brain } from "lucide-react"
import { startListening, speakText } from "@/lib/voice"
import { parseVoiceJournal, saveVoiceJournalEntry, detectActionItems } from "@/lib/voice-journaling"
import { addMemory } from "@/lib/memory-engine"
import { cn } from "@/lib/utils"

export function VoiceJournalModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [parsed, setParsed] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editedContent, setEditedContent] = useState("")

  const handleStartListening = async () => {
    setIsListening(true)
    setTranscript("")
    setParsed(null)
    setSaved(false)
    try {
      const text = await startListening(15000)
      setTranscript(text)
      setIsListening(false)
      setIsProcessing(true)
      const result = parseVoiceJournal(text)
      setParsed(result)
      setEditedContent(result.content)
      setIsProcessing(false)
    } catch {
      setIsListening(false)
    }
  }

  const handleSave = () => {
    const entry = saveVoiceJournalEntry({ ...parsed, content: editedContent || parsed.content })
    const actionItems = detectActionItems(editedContent || parsed.content)
    addMemory(editedContent || parsed.content, "journal", "voice-journal", parsed?.tags || [], 1, { entryId: entry.id })
    if (actionItems.length > 0) {
      actionItems.forEach((item: string) => {
        addMemory(`Action item: ${item}`, "goal", "voice-journal-extraction", ["action-item"], 2)
      })
    }
    setSaved(true)
  }

  const moodColors: Record<string, string> = {
    great: "text-success bg-success/10 border-success/20",
    good: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    okay: "text-white/50 bg-white/[0.04] border-white/[0.06]",
    bad: "text-warning bg-warning/10 border-warning/20",
    awful: "text-danger bg-danger/10 border-danger/20",
  }

  const moodEmojis: Record<string, string> = {
    great: "🌟", good: "👍", okay: "😐", bad: "😞", awful: "💔",
  }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-white/50 hover:text-white/70 flex items-center justify-center gap-2 transition-all"
      >
        <Mic className="w-3.5 h-3.5" />
        Voice Journal
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 rounded-xl border border-white/[0.08] bg-black/40 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-medium text-white/70">Voice Journal Entry</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-white/60">
              <X className="w-4 h-4" />
            </button>
          </div>

          {!transcript && !isProcessing && (
            <div className="flex flex-col items-center gap-3 py-6">
              <button onClick={handleStartListening} disabled={isListening}
                className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center transition-all",
                  isListening ? "bg-danger/20 border-danger/30 animate-pulse" : "bg-brand-500/20 border-brand-500/30 hover:bg-brand-500/30"
                )}
              >
                {isListening ? <Loader2 className="w-7 h-7 text-danger animate-spin" /> : <Mic className="w-7 h-7 text-brand-400" />}
              </button>
              <p className="text-xs text-white/40">{isListening ? "Listening... speak naturally" : "Tap the mic and tell me about your day"}</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
              <span className="text-sm text-white/50">Analyzing your entry...</span>
            </div>
          )}

          {parsed && !saved && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <button key={mood} onClick={() => setParsed({ ...parsed, mood })}
                    className={cn(
                      "px-3 h-8 rounded-lg text-xs font-medium border transition-all",
                      parsed.mood === mood ? moodColors[mood] : "text-white/30 border-white/[0.06] hover:text-white/50"
                    )}
                  >
                    {emoji} {mood}
                  </button>
                ))}
              </div>

              {showEdit ? (
                <textarea
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                  className="w-full h-24 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-white/70 resize-none outline-none focus:border-brand-500/40"
                />
              ) : (
                <p className="text-sm text-white/70 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  onClick={() => setShowEdit(true)}>
                  {parsed.content}
                </p>
              )}

              {parsed.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {parsed.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/[0.04] text-white/40 border border-white/[0.06] flex items-center gap-1">
                      <Tag className="w-3 h-3" />{tag}
                    </span>
                  ))}
                </div>
              )}

              {parsed.goals.length > 0 && (
                <div className="p-3 rounded-xl bg-warning/[0.03] border border-warning/10">
                  <p className="text-xs text-warning mb-1">Detected Action Items:</p>
                  {parsed.goals.map((g: string, i: number) => (
                    <p key={i} className="text-sm text-white/60">• {g}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleSave}
                  className="flex-1 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 text-sm font-medium text-brand-400 hover:bg-brand-500/30 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" /> Save Entry
                </button>
                <button onClick={() => { setParsed(null); setTranscript(""); setIsOpen(false) }}
                  className="h-9 px-4 rounded-xl text-xs text-white/40 hover:text-white/60 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-4"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
              <p className="text-sm font-medium text-white/70">Entry Saved!</p>
              <p className="text-xs text-white/40 text-center">
                Mood: {parsed.mood} · Tags: {parsed.tags?.join(", ")}
              </p>
              <p className="text-xs text-warning">{detectActionItems(editedContent || parsed.content).length} action items detected</p>
              <button onClick={() => { setIsOpen(false); setSaved(false); setParsed(null); setTranscript("") }}
                className="mt-2 h-8 px-4 rounded-lg text-xs text-white/40 hover:text-white/60 bg-white/[0.04] border border-white/[0.06]"
              >
                Close
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </>
  )
}
