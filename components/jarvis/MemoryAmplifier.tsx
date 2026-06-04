"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Search, Clock, Target, GitBranch, BookOpen,
  Flame, Dumbbell, Award, AlertTriangle, Star, Trash2,
  BarChart3, TrendingUp, Filter,
} from "lucide-react"
import { getAllMemories, getMemoryStats, searchMemories, deleteMemory, addMemory, autoExtractMemories, type LifeMemory, type MemoryCategory } from "@/lib/memory-engine"
import { cn } from "@/lib/utils"

const CATEGORY_CONFIG: Record<string, { icon: any; color: string }> = {
  goal: { icon: Target, color: "text-success" },
  milestone: { icon: Award, color: "text-brand-400" },
  decision: { icon: GitBranch, color: "text-accent-400" },
  project: { icon: Brain, color: "text-brand-400" },
  journal: { icon: BookOpen, color: "text-text-secondary" },
  habit: { icon: Flame, color: "text-warning" },
  workout: { icon: Dumbbell, color: "text-success" },
  learning: { icon: Brain, color: "text-brand-400" },
  achievement: { icon: Award, color: "text-success" },
  failure: { icon: AlertTriangle, color: "text-danger" },
  lesson: { icon: Star, color: "text-warning" },
  preference: { icon: Star, color: "text-accent-400" },
  fact: { icon: Brain, color: "text-text-tertiary" },
}

export function MemoryAmplifier() {
  const [memories, setMemories] = useState<LifeMemory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newText, setNewText] = useState("")
  const [newCategory, setNewCategory] = useState<MemoryCategory>("fact")
  const [newTags, setNewTags] = useState("")
  const [extracting, setExtracting] = useState(false)

  const loadMemories = useCallback(() => {
    const all = searchQuery ? searchMemories(searchQuery) : getAllMemories()
    setMemories(selectedCategory === "all" ? all : all.filter(m => m.category === selectedCategory))
  }, [searchQuery, selectedCategory])

  useEffect(() => { loadMemories() }, [loadMemories])

  const stats = useMemo(() => getMemoryStats(), [])

  const handleDelete = (id: string) => {
    deleteMemory(id)
    loadMemories()
  }

  const handleAdd = () => {
    if (!newText.trim()) return
    const tags = newTags.split(",").map(t => t.trim()).filter(Boolean)
    addMemory(newText.trim(), newCategory, "manual", tags, 1)
    setNewText("")
    setNewTags("")
    setShowAddForm(false)
    loadMemories()
  }

  const handleAutoExtract = async () => {
    setExtracting(true)
    const count = autoExtractMemories()
    loadMemories()
    setTimeout(() => setExtracting(false), 1000)
  }

  const displayed = searchQuery ? searchMemories(searchQuery) : getAllMemories()
  const filtered = selectedCategory === "all" ? displayed : displayed.filter(m => m.category === selectedCategory)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-text-secondary outline-none focus:border-brand-500/40 placeholder:text-text-muted"
          />
        </div>
        <button onClick={handleAutoExtract} disabled={extracting}
          className="h-9 px-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-medium text-brand-400 hover:bg-brand-500/20 transition-all flex items-center gap-1.5"
        >
          <Brain className="w-3.5 h-3.5" /> {extracting ? "Extracting..." : "Auto-Extract"}
        </button>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-text-tertiary hover:text-text-secondary transition-all"
        >
          + Add
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total, icon: Brain, color: "text-brand-400" },
          { label: "Categories", value: Object.keys(stats.byCategory).length, icon: BarChart3, color: "text-accent-400" },
          { label: "Memory Streak", value: `${stats.longestStreak}d`, icon: TrendingUp, color: "text-success" },
          { label: "High Impact", value: stats.highImportance, icon: Star, color: "text-warning" },
        ].map((stat, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-tertiary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setSelectedCategory("all")}
          className={cn("px-2.5 h-7 rounded-lg text-xs font-medium border transition-all",
            selectedCategory === "all" ? "bg-brand-500/20 text-brand-400 border-brand-500/30" : "text-text-tertiary border-white/[0.06] hover:text-text-tertiary"
          )}>All</button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <button key={key} onClick={() => setSelectedCategory(key)}
            className={cn("px-2.5 h-7 rounded-lg text-xs font-medium border transition-all flex items-center gap-1",
              selectedCategory === key ? "bg-brand-500/20 text-brand-400 border-brand-500/30" : "text-text-tertiary border-white/[0.06] hover:text-text-tertiary"
            )}>
            <config.icon className={`w-3 h-3 ${config.color}`} />{key}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2"
          >
            <textarea value={newText} onChange={e => setNewText(e.target.value)}
              placeholder="What do you want to remember?"
              className="w-full h-20 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-sm text-text-secondary resize-none outline-none focus:border-brand-500/40 placeholder:text-text-muted"
            />
            <div className="flex gap-2 flex-wrap">
              <select value={newCategory} onChange={e => setNewCategory(e.target.value as MemoryCategory)}
                className="h-8 px-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-text-tertiary outline-none"
              >
                {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={newTags} onChange={e => setNewTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="flex-1 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-text-tertiary outline-none focus:border-brand-500/40 placeholder:text-text-muted min-w-0"
              />
              <button onClick={handleAdd}
                className="h-8 px-4 rounded-lg bg-brand-500/20 border border-brand-500/30 text-xs font-medium text-brand-400 hover:bg-brand-500/30"
              >Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-tertiary py-8">No memories yet. Use auto-extract or add manually.</p>
        )}
        {filtered.map((memory) => {
          const config = CATEGORY_CONFIG[memory.category] || CATEGORY_CONFIG.fact
          const Icon = config.icon
          return (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary">{memory.text}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-text-muted">{memory.category}</span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted">{memory.date}</span>
                  {memory.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[11px] bg-white/[0.04] text-text-tertiary">{t}</span>
                  ))}
                  {memory.importance >= 3 && <Star className="w-3 h-3 text-warning" />}
                </div>
              </div>
              <button onClick={() => handleDelete(memory.id)}
                className="shrink-0 h-7 w-7 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
