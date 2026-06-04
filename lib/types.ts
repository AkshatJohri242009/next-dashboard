export interface Goal {
  text: string
  done: boolean
  queued?: boolean
  pushedCount?: number
  doneAt?: number
  reminderMin?: number
  progress?: number
  priority?: "low" | "medium" | "high"
  dueDate?: string
  estimatedMinutes?: number
}

export interface Reminder {
  id: string
  text: string
  type: "water" | "task" | "gym"
  dueAt: number
  completed: boolean
  goalIdx?: number
}

export type GoalStatus = 'empty' | 'done' | 'pending'

export interface TickerItem {
  status: GoalStatus
  text: string
}

export interface SupplementWindow {
  id: string
  title: string
  time: string
  hourStart: number
  hourEnd: number
  items: string[]
}

export interface HealthState {
  weight: number
  age: number
  activity: number
  caffeine: number
  stimulants: number
  waterMl: number
  done: Record<string, boolean>
  low: Record<string, boolean>
}

export interface WorkoutLog {
  exercise: string
  split: string
  sets: number
  weight: number
  reps: number[]
  at: number
}

export interface GymState {
  split: string
  logs: WorkoutLog[]
  photos: Record<string, string>
  customExercises: string[]
}

export interface WeightEntry {
  date: string
  weight: number
  note?: string
}

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  topics: string[]
  fork: boolean
}

export interface SleepEntry {
  date: string
  minutes: number
}

export interface TrackedProject {
  name: string
  totalMinutes: number
  startTime: number | null
}

export type Page = 'main' | 'health' | 'gym' | 'weight' | 'projects' | 'study' | 'study-tasks' | 'study-exams' | 'study-files' | 'study-sounds' | 'study-commute'

export interface StockHolding {
  symbol: string
  shares: number
  buyPrice?: number
  addedAt: number
}

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  name?: string
  currency?: string
}

export interface StockHistoryPoint {
  date: string
  close: number
}

export interface StockState {
  holdings: StockHolding[]
  quotes: Record<string, StockQuote>
  expandedSymbol: string | null
}

export interface ThemeConfig {
  mode: "dark" | "light"
  brandColor: string
  accentColor: string
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  mood: "great" | "good" | "okay" | "bad" | "awful"
  tags: string[]
  createdAt: number
}

export interface Chapter {
  id: string
  subject: string
  name: string
  completed: boolean
  score: number | null
  date: string | null
}

export interface Mission {
  id: string
  title: string
  description: string
  milestones: { title: string; done: boolean }[]
  status: "active" | "completed" | "paused"
  deadline: string | null
  createdAt: number
}

export interface Decision {
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

export interface Idea {
  id: string
  title: string
  description: string
  connections: string[]
  tags: string[]
  createdAt: number
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  category: "career" | "education" | "relationship" | "move" | "achievement" | "other"
  createdAt: number
}

export interface Habit {
  id: string
  name: string
  category: "health" | "learning" | "productivity" | "mindfulness"
  streak: number
  logs: string[]
  createdAt: number
}
