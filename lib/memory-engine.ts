"use client"

export type MemoryCategory = "goal" | "milestone" | "decision" | "project" | "journal" | "habit" | "workout" | "learning" | "achievement" | "failure" | "lesson" | "preference" | "fact"

export interface LifeMemory {
  id: string
  text: string
  category: MemoryCategory
  source: string
  timestamp: number
  date: string
  tags: string[]
  importance: number
  metadata?: Record<string, any>
}

const STORAGE_KEY = "lifeos_memory_engine"
const SIMILARITY_KEY = "lifeos_memory_similarity"

export function addMemory(text: string, category: MemoryCategory, source: string, tags: string[] = [], importance = 1, metadata?: Record<string, any>) {
  const memories = getAllMemories()
  const memory: LifeMemory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    category,
    source,
    timestamp: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    tags,
    importance,
    metadata,
  }
  memories.unshift(memory)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories))
  return memory
}

export function getAllMemories(): LifeMemory[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

export function getMemoriesByCategory(category: MemoryCategory): LifeMemory[] {
  return getAllMemories().filter(m => m.category === category)
}

export function getMemoriesByDateRange(startDate: string, endDate: string): LifeMemory[] {
  return getAllMemories().filter(m => m.date >= startDate && m.date <= endDate)
}

export function searchMemories(query: string): LifeMemory[] {
  const lower = query.toLowerCase()
  return getAllMemories().filter(m =>
    m.text.toLowerCase().includes(lower) ||
    m.tags.some(t => t.toLowerCase().includes(lower)) ||
    m.category.toLowerCase().includes(lower)
  )
}

export function deleteMemory(id: string) {
  const memories = getAllMemories().filter(m => m.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories))
}

export function getMemoryStats() {
  const all = getAllMemories()
  const byCategory: Record<string, number> = {}
  all.forEach(m => { byCategory[m.category] = (byCategory[m.category] || 0) + 1 })
  const byMonth: Record<string, number> = {}
  all.forEach(m => {
    const month = m.date.slice(0, 7)
    byMonth[month] = (byMonth[month] || 0) + 1
  })
  const highImportance = all.filter(m => m.importance >= 3).length
  return {
    total: all.length,
    byCategory,
    byMonth,
    highImportance,
    longestStreak: computeMemoryStreak(all),
    oldest: all.length > 0 ? all[all.length - 1]?.date : null,
    newest: all.length > 0 ? all[0]?.date : null,
  }
}

function computeMemoryStreak(memories: LifeMemory[]): number {
  if (memories.length === 0) return 0
  const dates = [...new Set(memories.map(m => m.date))].sort()
  let streak = 1
  let maxStreak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff <= 1) { streak++; maxStreak = Math.max(maxStreak, streak) }
    else streak = 1
  }
  return maxStreak
}

export function getSimilarMemories(text: string, limit = 5): LifeMemory[] {
  const all = getAllMemories()
  const queryWords = text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  if (queryWords.length === 0) return all.slice(0, limit)

  const scored = all.map(m => {
    const memWords = m.text.toLowerCase().split(/\s+/)
    const tagWords = m.tags.join(" ").toLowerCase().split(/\s+/)
    const catWords = m.category.toLowerCase()
    const allWords = [...memWords, ...tagWords, catWords]
    const matches = queryWords.filter(qw => allWords.some(mw => mw.includes(qw) || qw.includes(mw)))
    return { memory: m, score: matches.length / queryWords.length }
  })

  const cache: Record<string, number> = {}
  try {
    const stored = JSON.parse(localStorage.getItem(SIMILARITY_KEY) || "{}")
    Object.assign(cache, stored)
  } catch {}

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.memory)
}

export function autoExtractMemories() {
  const existingMemories = getAllMemories()
  const existingTexts = new Set(existingMemories.map(m => m.text.toLowerCase().trim()))
  let added = 0

  const journal = loadJSON("lifeos_journal") || []
  if (Array.isArray(journal)) {
    journal.forEach((entry: any) => {
      if (entry.content && !existingTexts.has(entry.content.toLowerCase().trim())) {
        addMemory(entry.content, "journal", "voice-journal", [entry.mood || "okay", ...(entry.tags || [])], 1)
        added++
      }
    })
  }

  const missions = loadJSON("lifeos_missions") || []
  if (Array.isArray(missions)) {
    missions.forEach((m: any) => {
      const text = `Mission: ${m.title} - ${m.status}`
      if (!existingTexts.has(text.toLowerCase())) {
        addMemory(text, "milestone", "missions", m.milestones?.filter((ms: any) => ms.done).map((ms: any) => ms.title) || [], m.status === "completed" ? 3 : 2)
        added++
      }
    })
  }

  const decisions = loadJSON("lifeos_decisions") || []
  if (Array.isArray(decisions)) {
    decisions.forEach((d: any) => {
      const text = `Decision: ${d.title} - chose ${d.chosen} - outcome: ${d.outcome}`
      if (!existingTexts.has(text.toLowerCase())) {
        addMemory(text, "decision", "decision-log", d.tags || [], d.outcome === "positive" ? 3 : 2, { chosen: d.chosen, outcome: d.outcome })
        added++
      }
    })
  }

  const habits = loadJSON("lifeos_habits") || []
  if (Array.isArray(habits)) {
    habits.forEach((h: any) => {
      if (h.streak >= 7) {
        const text = `Habit streak: ${h.name} - ${h.streak} days`
        if (!existingTexts.has(text.toLowerCase())) {
          addMemory(text, "habit", "habits", [h.category || "general"], 2)
          added++
        }
      }
    })
  }

  const chapters = loadJSON("lifeos_chapters") || []
  if (Array.isArray(chapters)) {
    chapters.filter((c: any) => c.completed).forEach((c: any) => {
      const text = `Completed ${c.subject}: ${c.name}${c.score ? ` (score: ${c.score}%)` : ""}`
      if (!existingTexts.has(text.toLowerCase())) {
        addMemory(text, "learning", "learning-os", [c.subject], c.score && c.score >= 80 ? 3 : 1)
        added++
      }
    })
  }

  return added
}

function loadJSON(key: string): any {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}
