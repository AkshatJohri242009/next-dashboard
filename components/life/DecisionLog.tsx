"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitBranch, Plus, Trash2, ThumbsUp, ThumbsDown, Minus, CheckCircle2, Clock } from "lucide-react"
import { markModified } from "@/lib/store"

interface Decision {
  id: string
  title: string
  context: string
  options: string[]
  chosen: string
  outcome: "positive" | "neutral" | "negative"
  reflection: string
  tags: string[]
  createdAt: number
}

const STORAGE_KEY = "lifeos_decisions"

function load(): Decision[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function DecisionLog() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [context, setContext] = useState("")
  const [optionInput, setOptionInput] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [chosen, setChosen] = useState("")
  const [outcome, setOutcome] = useState<Decision["outcome"]>("neutral")
  const [reflection, setReflection] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => { setDecisions(load()) }, [])

  const save = (updated: Decision[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setDecisions(updated)
  }

  const addDecision = () => {
    if (!title.trim() || !chosen) return
    const decision: Decision = {
      id: `dec_${Date.now()}`,
      title: title.trim(),
      context: context.trim(),
      options,
      chosen,
      outcome,
      reflection: reflection.trim(),
      tags,
      createdAt: Date.now(),
    }
    save([decision, ...decisions])
    setTitle(""); setContext(""); setOptions([]); setChosen(""); setOutcome("neutral"); setReflection(""); setTags([]); setShowForm(false)
  }

  const deleteDecision = (id: string) => save(decisions.filter(d => d.id !== id))

  const outcomeIcon = (o: Decision["outcome"]) => {
    if (o === "positive") return <ThumbsUp className="w-3 h-3" />
    if (o === "negative") return <ThumbsDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-4 h-4 text-accent" />
          <h3 className="section-title text-sm">Decision Log</h3>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="h-8 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-[11px] font-medium transition-colors"
        >
          + Decision
        </button>
      </div>

      {/* Decision Analytics */}
      {decisions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] text-white/40 font-medium">{decisions.length} Decisions</span>
          </div>
          {(["positive", "neutral", "negative"] as const).map(o => {
            const count = decisions.filter(d => d.outcome === o).length
            const pct = Math.round(count / decisions.length * 100)
            const color = o === "positive" ? "var(--success)" : o === "negative" ? "var(--danger)" : "var(--warning)"
            return (
              <div key={o} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-mono text-white/50">{pct}%</span>
                <span className="text-[9px] text-white/30 capitalize">{o}</span>
              </div>
            )
          })}
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <span className="text-[10px] font-medium" style={{
            color: decisions.filter(d => d.outcome === "positive").length > decisions.filter(d => d.outcome === "negative").length
              ? "var(--success)" : "var(--warning)"
          }}>
            {Math.round(decisions.filter(d => d.outcome === "positive").length / decisions.length * 100)}% positive rate
          </span>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Decision title..." className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30" />
              <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Context — what led to this decision?" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 resize-none" />

              <div>
                <div className="flex gap-2 mb-1">
                  <input value={optionInput} onChange={e => setOptionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && optionInput.trim()) { setOptions([...options, optionInput.trim()]); setOptionInput("") } }}
                    placeholder="Add option..." className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30" />
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {options.map((o, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/50 flex items-center gap-1">
                        <button onClick={() => { setChosen(o); setOutcome(o === chosen ? outcome : "neutral") }}
                          className={`${chosen === o ? "text-brand" : "text-white/30 hover:text-white/70"}`}
                          aria-label={`Select ${o}`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </button>
                        {o}
                        <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-white/20 hover:text-white/50">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                {chosen && <p className="text-[10px] text-brand">Chosen: {chosen}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["positive", "neutral", "negative"] as const).map(o => (
                  <button key={o} onClick={() => setOutcome(o)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize flex items-center gap-1 ${
                      outcome === o ? "ring-2 ring-offset-1 ring-offset-[var(--bg)] text-white" : "text-white/40"
                    }`}
                    style={{
                      backgroundColor: outcome === o ? `var(--${o === "positive" ? "success" : o === "negative" ? "danger" : "warning"})20` : "rgba(255,255,255,0.05)",
                      color: outcome === o ? `var(--${o === "positive" ? "success" : o === "negative" ? "danger" : "warning"})` : undefined,
                      outlineColor: outcome === o ? `var(--${o === "positive" ? "success" : o === "negative" ? "danger" : "warning"})` : undefined,
                    }}
                  >
                    {outcomeIcon(o)} {o}
                  </button>
                ))}
              </div>

              <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="What did you learn? Was it the right call?" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 resize-none" />

              <div className="flex flex-col sm:flex-row gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput("") } }}
                  placeholder="Tags..." className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30" />
                <button onClick={addDecision} disabled={!title.trim() || !chosen}
                  className="h-8 px-4 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-xs font-medium disabled:opacity-30 transition-colors"
                >
                  Log Decision
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/50">
                      #{t} <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-white/20 hover:text-white/50">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {decisions.length === 0 && (
          <div className="text-center py-8">
            <GitBranch className="w-6 h-6 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No decisions logged yet. Every major choice is a data point.</p>
          </div>
        )}
        {decisions.map(d => (
          <motion.div key={d.id} layout className="group p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-white/80">{d.title}</span>
                  <span className="flex items-center gap-1 text-[10px]"
                    style={{ color: d.outcome === "positive" ? "var(--success)" : d.outcome === "negative" ? "var(--danger)" : "var(--warning)" }}
                  >
                    {outcomeIcon(d.outcome)} {d.outcome}
                  </span>
                </div>
                {d.context && <p className="text-[11px] text-white/40 mb-1 line-clamp-2">{d.context}</p>}
                {d.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {d.options.map((o, i) => (
                      <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] ${o === d.chosen ? "bg-brand/20 text-brand" : "bg-white/5 text-white/30"}`}>
                        {o}
                      </span>
                    ))}
                  </div>
                )}
                {d.reflection && <p className="text-[10px] text-white/30 italic">{d.reflection}</p>}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Clock className="w-2.5 h-2.5 text-white/20" />
                  <span className="text-[9px] text-white/20">{new Date(d.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  {d.tags.map(t => <span key={t} className="text-[9px] text-white/20">#{t}</span>)}
                </div>
              </div>
              <button onClick={() => deleteDecision(d.id)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 h-8 w-8 rounded flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all flex-shrink-0"
                aria-label="Delete decision"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
