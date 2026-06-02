"use client"

const MOOD_KEYWORDS: Record<string, string[]> = {
  great: ["amazing", "fantastic", "wonderful", "excellent", "incredible", "thrilled", "ecstatic", "perfect", "best", "beautiful", "awesome", "love", "joy", "accomplished", "proud", "energized"],
  good: ["good", "nice", "fine", "happy", "glad", "positive", "productive", "solid", "decent", "satisfied", "calm", "peaceful", "focused", "motivated", "grateful", "content"],
  okay: ["okay", "alright", "fine", "neutral", "normal", "average", "typical", "standard", "usual", "moderate", "blah", "meh", "so-so", "fair"],
  bad: ["bad", "tired", "stressed", "anxious", "worried", "frustrated", "annoyed", "difficult", "hard", "rough", "tough", "sad", "down", "disappointed", "exhausted", "overwhelmed"],
  awful: ["awful", "terrible", "horrible", "miserable", "depressed", "angry", "devastated", "hopeless", "worst", "dreadful", "hate", "sick", "crushed", "broken"],
}

const GOAL_KEYWORDS: { pattern: RegExp; tag: string }[] = [
  { pattern: /(?:studied|revised|completed|learning|reading|practiced) (.*?)(?:\.|$)/i, tag: "learning" },
  { pattern: /(?:worked out|gym|exercise|ran|walked|swam|cycled|trained|yoga)/i, tag: "fitness" },
  { pattern: /(?:finished|completed|worked on|progress|built|created) (.*?)(?:\.|$)/i, tag: "project" },
  { pattern: /(?:meditated|mindfulness|journaled|read|reflected)/i, tag: "mindfulness" },
  { pattern: /(?:coded|programmed|built|developed|deployed|fixed)/i, tag: "coding" },
  { pattern: /(?:ate healthy|cooked|meal prep|drank water|hydrated)/i, tag: "health" },
  { pattern: /(?:met|hung out|called|talked to|spent time with) (.*?)(?:\.|$)/i, tag: "social" },
  { pattern: /(?:woke up|slept|napped|rested)/i, tag: "sleep" },
]

export interface ParsedJournalEntry {
  content: string
  mood: "great" | "good" | "okay" | "bad" | "awful"
  tags: string[]
  goals: string[]
}

export function parseVoiceJournal(text: string): ParsedJournalEntry {
  const lower = text.toLowerCase()
  let mood: ParsedJournalEntry["mood"] = "okay"
  const scores: Record<string, number> = { great: 0, good: 0, okay: 0, bad: 0, awful: 0 }

  for (const [moodLevel, keywords] of Object.entries(MOOD_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[moodLevel]++
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  if (best && best[1] > 0) mood = best[0] as ParsedJournalEntry["mood"]

  const tags: string[] = [mood]
  const goals: string[] = []
  for (const { pattern, tag } of GOAL_KEYWORDS) {
    if (pattern.test(text)) {
      if (!tags.includes(tag)) tags.push(tag)
      const match = pattern.exec(text)
      if (match && match[1] && match[1].trim()) {
        goals.push(match[1].trim())
      }
    }
  }

  return { content: text, mood, tags, goals }
}

export function detectActionItems(text: string): string[] {
  const items: string[] = []
  const patterns = [
    /(?:need to|have to|must|should|will|going to) (.*?)(?:\.|$)/gi,
    /(?:tomorrow|next week|later) (.*?)(?:\.|$)/gi,
  ]
  for (const pattern of patterns) {
    let m: RegExpExecArray | null
    while ((m = pattern.exec(text)) !== null) {
      if (m[1]?.trim()) items.push(m[1].trim())
    }
  }
  return items
}

export function saveVoiceJournalEntry(parsed: ParsedJournalEntry) {
  const key = "lifeos_journal"
  const existing = loadJSON(key) || []
  const entry = {
    id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
    content: parsed.content,
    mood: parsed.mood,
    tags: parsed.tags,
    createdAt: Date.now(),
  }
  existing.unshift(entry)
  localStorage.setItem(key, JSON.stringify(existing))
  try {
    const { markModified } = require("./store")
    markModified(key)
  } catch {}
  return entry
}

function loadJSON(key: string): any {
  try { return JSON.parse(localStorage.getItem(key) || "null") }
  catch { return null }
}
