"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Plus, X, Link2, Zap } from "lucide-react"
import { markModified } from "@/lib/store"

interface Idea {
  id: string
  title: string
  description: string
  connections: string[]
  tags: string[]
  createdAt: number
}

const STORAGE_KEY = "lifeos_brain"

function load(): Idea[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function KnowledgeGraph() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [connectionSearch, setConnectionSearch] = useState("")
  const graphRef = useRef<HTMLDivElement>(null)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})

  useEffect(() => { setIdeas(load()) }, [])

  const save = (updated: Idea[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    markModified(STORAGE_KEY)
    setIdeas(updated)
  }

  const addIdea = () => {
    if (!title.trim()) return
    const idea: Idea = {
      id: `idea_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      connections: [],
      tags,
      createdAt: Date.now(),
    }
    save([idea, ...ideas])
    setTitle(""); setDescription(""); setTags([]); setShowForm(false)
  }

  const deleteIdea = (id: string) => {
    save(ideas.filter(i => i.id !== id).map(i => ({ ...i, connections: i.connections.filter(c => c !== id) })))
    if (selectedIdea === id) setSelectedIdea(null)
  }

  const toggleConnection = (targetId: string) => {
    if (!selectedIdea) return
    const updated = ideas.map(i => {
      if (i.id !== selectedIdea) return i
      const connections = i.connections.includes(targetId)
        ? i.connections.filter(c => c !== targetId)
        : [...i.connections, targetId]
      return { ...i, connections }
    })
    save(updated)
  }

  const selected = ideas.find(i => i.id === selectedIdea)
  const connections = selected ? ideas.filter(i => selected.connections.includes(i.id)) : []

  const updatePositions = useCallback(() => {
    if (!graphRef.current) return
    const buttons = graphRef.current.querySelectorAll<HTMLButtonElement>("[data-node-id]")
    const positions: Record<string, { x: number; y: number }> = {}
    buttons.forEach((btn) => {
      const id = btn.getAttribute("data-node-id")
      if (!id) return
      const rect = btn.getBoundingClientRect()
      const parentRect = graphRef.current!.getBoundingClientRect()
      positions[id] = {
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top + rect.height / 2,
      }
    })
    setNodePositions(positions)
  }, [])

  useEffect(() => {
    updatePositions()
    const timer = setTimeout(updatePositions, 100)
    window.addEventListener("resize", updatePositions)
    return () => { clearTimeout(timer); window.removeEventListener("resize", updatePositions) }
  }, [ideas, selectedIdea, updatePositions])

  const connectionLines = (() => {
    if (!selected) return []
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
    selected.connections.forEach((connId) => {
      const from = nodePositions[selected.id]
      const to = nodePositions[connId]
      if (from && to) lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y })
    })
    return lines
  })()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-accent" />
          <h3 className="section-heading">Second Brain</h3>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="h-8 px-3 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-[11px] font-medium transition-colors"
        >
          + Idea
        </button>
      </div>

      {/* Graph Visualization */}
      <div ref={graphRef} className="relative w-full min-h-[220px] rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 overflow-hidden">
        {ideas.length === 0 ? (
          <div className="text-center py-10">
            <Brain className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">Your Second Brain is empty. Start adding ideas to build your knowledge graph.</p>
          </div>
        ) : (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {connectionLines.map((line, i) => (
                <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="rgba(116,143,252,0.25)" strokeWidth="2" strokeDasharray="4 3" />
              ))}
            </svg>
            <div className="flex flex-wrap gap-3 justify-center items-center min-h-[180px] relative" style={{ zIndex: 2 }}>
              {ideas.slice(0, 24).map(idea => {
                const isSelected = selectedIdea === idea.id
                const isConnected = selected?.connections.includes(idea.id)
                const connectionCount = idea.connections.length
                const relatedCount = ideas.filter(i => i.connections.includes(idea.id)).length
                return (
                  <motion.button
                    key={idea.id}
                    layout
                    data-node-id={idea.id}
                    onClick={() => setSelectedIdea(isSelected ? null : idea.id)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-medium transition-all border ${
                      isSelected
                        ? "border-accent/50 bg-accent/10 text-accent shadow-[0_0_20px_rgba(116,143,252,0.2)]"
                        : isConnected
                          ? "border-brand/30 bg-brand/5 text-brand"
                          : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}
                    style={{
                      boxShadow: isConnected ? "0 0 12px rgba(59,203,133,0.1)" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Zap className={`w-3 h-3 ${isSelected ? "text-accent" : "text-white/30"}`} />
                      <span className="truncate max-w-[100px] sm:max-w-[120px]">{idea.title}</span>
                      {(connectionCount > 0 || relatedCount > 0) && (
                        <span className="text-[11px] px-1 py-0.5 rounded-full bg-white/10 text-white/30">
                          {connectionCount + relatedCount}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <input value={title} onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && title.trim()) addIdea() }}
                placeholder="Idea title..." className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this idea..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 resize-none" />
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput("") } }}
                  placeholder="Add tag..." className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30" />
                <button onClick={addIdea} disabled={!title.trim()}
                  className="h-8 px-4 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent text-xs font-medium disabled:opacity-30 transition-colors"
                >
                  Save
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/50">
                      #{t} <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-white/20 hover:text-white/50">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white/80 truncate">{selected.title}</h4>
                  {selected.description && <p className="text-[11px] text-white/40 mt-1">{selected.description}</p>}
                  {selected.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selected.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[11px] text-white/30">#{t}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteIdea(selected.id)}
                  className="h-8 w-8 rounded flex items-center justify-center hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Delete idea"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/40 uppercase tracking-wider">Connections</span>
                </div>
                <input value={connectionSearch} onChange={e => setConnectionSearch(e.target.value)}
                  placeholder="Search ideas to connect..." className="w-full h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-white/30 mb-2" />
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {ideas
                    .filter(i => i.id !== selected.id && (!connectionSearch || i.title.toLowerCase().includes(connectionSearch.toLowerCase())))
                    .slice(0, 15)
                    .map(i => {
                      const isConnected = selected.connections.includes(i.id)
                      return (
                        <button key={i.id} onClick={() => toggleConnection(i.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            isConnected ? "bg-brand/20 text-brand border border-brand/30" : "bg-white/5 text-white/40 hover:text-white/60 border border-transparent"
                          }`}
                        >
                          {i.title}
                          {isConnected && <span className="ml-1">✓</span>}
                        </button>
                      )
                    })}
                </div>
                {connections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/40 mb-2">Connected Ideas</p>
                    <div className="space-y-1">
                      {connections.map(c => (
                        <button key={c.id} onClick={() => setSelectedIdea(c.id)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded w-full text-left hover:bg-white/5 transition-colors"
                        >
                          <Zap className="w-3 h-3 text-brand flex-shrink-0" />
                          <span className="text-[11px] text-white/50 truncate">{c.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Ideas */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {ideas.slice(0, 10).map(idea => (
          <button key={idea.id}
            onClick={() => setSelectedIdea(selectedIdea === idea.id ? null : idea.id)}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors w-full text-left"
          >
            <Zap className={`w-3 h-3 ${selectedIdea === idea.id ? "text-accent" : "text-white/20"} flex-shrink-0`} />
            <span className="text-xs text-white/60 flex-1 min-w-0 truncate">{idea.title}</span>
            <span className="text-[11px] text-white/20">{idea.connections.length} connections</span>
          </button>
        ))}
      </div>
    </div>
  )
}
