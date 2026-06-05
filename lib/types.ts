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

export type ThemePresetName = "claude" | "opencode-green" | "opencode-github" | "vercel-blue" | "vercel-geist"

export interface ThemeColors {
  bg: string
  bgSecondary: string
  bgElevated: string
  brand: string
  brand500: string
  accent: string
  accent500: string
  glassBg: string
  glassStrongBg: string
  glassElevatedBg: string
  glassTintedBg: string
  glassTintedEdge: string
  glassAccentBg: string
  glassAccentEdge: string
  text: string
  textSecondary: string
  textTertiary: string
  textMuted: string
  border: string
  borderStrong: string
}

export interface ThemePreset {
  name: string
  icon: string
  dark: ThemeColors
  light: ThemeColors
}

export const THEME_PRESETS: Record<ThemePresetName, ThemePreset> = {
  claude: {
    name: "Claude",
    icon: "🟠",
    dark: {
      bg: "#1A1817", bgSecondary: "#232120", bgElevated: "#2C2928",
      brand: "#C15F3C", brand500: "#C15F3C",
      accent: "#C15F3C", accent500: "#C15F3C",
      glassBg: "rgba(44,41,40,0.62)", glassStrongBg: "rgba(50,47,45,0.72)", glassElevatedBg: "rgba(58,55,52,0.82)",
      glassTintedBg: "rgba(193,95,60,0.14)", glassTintedEdge: "0 0 0 0.5px rgba(193,95,60,0.18), inset 0 0.5px 0 rgba(193,95,60,0.20)",
      glassAccentBg: "rgba(193,95,60,0.14)", glassAccentEdge: "0 0 0 0.5px rgba(193,95,60,0.18), inset 0 0.5px 0 rgba(193,95,60,0.20)",
      text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.7)", textTertiary: "rgba(255,255,255,0.4)", textMuted: "rgba(255,255,255,0.2)",
      border: "rgba(255,255,255,0.06)", borderStrong: "rgba(255,255,255,0.12)",
    },
    light: {
      bg: "#FAF9F5", bgSecondary: "#FFFFFF", bgElevated: "#FFFFFF",
      brand: "#C15F3C", brand500: "#C15F3C",
      accent: "#C15F3C", accent500: "#C15F3C",
      glassBg: "rgba(255,255,255,0.65)", glassStrongBg: "rgba(255,255,255,0.78)", glassElevatedBg: "rgba(255,255,255,0.88)",
      glassTintedBg: "rgba(193,95,60,0.10)", glassTintedEdge: "0 0 0 0.5px rgba(193,95,60,0.15), inset 0 0.5px 0 rgba(193,95,60,0.12)",
      glassAccentBg: "rgba(193,95,60,0.10)", glassAccentEdge: "0 0 0 0.5px rgba(193,95,60,0.15), inset 0 0.5px 0 rgba(193,95,60,0.12)",
      text: "#1C1C1E", textSecondary: "rgba(60,60,67,0.6)", textTertiary: "rgba(60,60,67,0.3)", textMuted: "rgba(60,60,67,0.15)",
      border: "rgba(60,60,67,0.07)", borderStrong: "rgba(60,60,67,0.15)",
    },
  },
  "opencode-green": {
    name: "Opencode",
    icon: "🟢",
    dark: {
      bg: "#000000", bgSecondary: "#08080A", bgElevated: "#0A0A0D",
      brand: "#30D158", brand500: "#28C24E",
      accent: "#007AFF", accent500: "#0066D6",
      glassBg: "rgba(30,30,36,0.62)", glassStrongBg: "rgba(38,38,44,0.72)", glassElevatedBg: "rgba(48,48,55,0.82)",
      glassTintedBg: "rgba(48,209,88,0.14)", glassTintedEdge: "0 0 0 0.5px rgba(48,209,88,0.18), inset 0 0.5px 0 rgba(48,209,88,0.20)",
      glassAccentBg: "rgba(10,132,255,0.14)", glassAccentEdge: "0 0 0 0.5px rgba(10,132,255,0.18), inset 0 0.5px 0 rgba(10,132,255,0.20)",
      text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.7)", textTertiary: "rgba(255,255,255,0.4)", textMuted: "rgba(255,255,255,0.2)",
      border: "rgba(255,255,255,0.06)", borderStrong: "rgba(255,255,255,0.12)",
    },
    light: {
      bg: "#F2F2F7", bgSecondary: "#FFFFFF", bgElevated: "#FFFFFF",
      brand: "#34C759", brand500: "#28A745",
      accent: "#007AFF", accent500: "#0062CC",
      glassBg: "rgba(255,255,255,0.65)", glassStrongBg: "rgba(255,255,255,0.78)", glassElevatedBg: "rgba(255,255,255,0.88)",
      glassTintedBg: "rgba(52,199,89,0.10)", glassTintedEdge: "0 0 0 0.5px rgba(52,199,89,0.15), inset 0 0.5px 0 rgba(52,199,89,0.12)",
      glassAccentBg: "rgba(0,122,255,0.10)", glassAccentEdge: "0 0 0 0.5px rgba(0,122,255,0.15), inset 0 0.5px 0 rgba(0,122,255,0.12)",
      text: "#1C1C1E", textSecondary: "rgba(60,60,67,0.6)", textTertiary: "rgba(60,60,67,0.3)", textMuted: "rgba(60,60,67,0.15)",
      border: "rgba(60,60,67,0.07)", borderStrong: "rgba(60,60,67,0.15)",
    },
  },
  "opencode-github": {
    name: "GitHub",
    icon: "🐙",
    dark: {
      bg: "#0D1117", bgSecondary: "#161B22", bgElevated: "#1C2128",
      brand: "#30D158", brand500: "#28C24E",
      accent: "#58A6FF", accent500: "#4493F8",
      glassBg: "rgba(28,33,40,0.62)", glassStrongBg: "rgba(35,40,48,0.72)", glassElevatedBg: "rgba(44,50,58,0.82)",
      glassTintedBg: "rgba(48,209,88,0.14)", glassTintedEdge: "0 0 0 0.5px rgba(48,209,88,0.18), inset 0 0.5px 0 rgba(48,209,88,0.20)",
      glassAccentBg: "rgba(88,166,255,0.14)", glassAccentEdge: "0 0 0 0.5px rgba(88,166,255,0.18), inset 0 0.5px 0 rgba(88,166,255,0.20)",
      text: "#E6EDF3", textSecondary: "rgba(230,237,243,0.7)", textTertiary: "rgba(230,237,243,0.4)", textMuted: "rgba(230,237,243,0.2)",
      border: "rgba(230,237,243,0.06)", borderStrong: "rgba(230,237,243,0.12)",
    },
    light: {
      bg: "#FFFFFF", bgSecondary: "#F6F8FA", bgElevated: "#FFFFFF",
      brand: "#2DA44E", brand500: "#218838",
      accent: "#0969DA", accent500: "#0550AE",
      glassBg: "rgba(255,255,255,0.65)", glassStrongBg: "rgba(255,255,255,0.78)", glassElevatedBg: "rgba(255,255,255,0.88)",
      glassTintedBg: "rgba(45,164,78,0.10)", glassTintedEdge: "0 0 0 0.5px rgba(45,164,78,0.15), inset 0 0.5px 0 rgba(45,164,78,0.12)",
      glassAccentBg: "rgba(9,105,218,0.10)", glassAccentEdge: "0 0 0 0.5px rgba(9,105,218,0.15), inset 0 0.5px 0 rgba(9,105,218,0.12)",
      text: "#1F2328", textSecondary: "rgba(31,35,40,0.6)", textTertiary: "rgba(31,35,40,0.3)", textMuted: "rgba(31,35,40,0.15)",
      border: "rgba(31,35,40,0.07)", borderStrong: "rgba(31,35,40,0.15)",
    },
  },
  "vercel-blue": {
    name: "Vercel",
    icon: "▲",
    dark: {
      bg: "#000000", bgSecondary: "#0A0A0A", bgElevated: "#111111",
      brand: "#FFFFFF", brand500: "#FFFFFF",
      accent: "#0070F3", accent500: "#0761D1",
      glassBg: "rgba(30,30,30,0.62)", glassStrongBg: "rgba(38,38,38,0.72)", glassElevatedBg: "rgba(48,48,48,0.82)",
      glassTintedBg: "rgba(255,255,255,0.08)", glassTintedEdge: "0 0 0 0.5px rgba(255,255,255,0.12), inset 0 0.5px 0 rgba(255,255,255,0.15)",
      glassAccentBg: "rgba(0,112,243,0.14)", glassAccentEdge: "0 0 0 0.5px rgba(0,112,243,0.18), inset 0 0.5px 0 rgba(0,112,243,0.20)",
      text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.7)", textTertiary: "rgba(255,255,255,0.4)", textMuted: "rgba(255,255,255,0.2)",
      border: "rgba(255,255,255,0.06)", borderStrong: "rgba(255,255,255,0.12)",
    },
    light: {
      bg: "#FFFFFF", bgSecondary: "#FAFAFA", bgElevated: "#FFFFFF",
      brand: "#000000", brand500: "#000000",
      accent: "#0070F3", accent500: "#0761D1",
      glassBg: "rgba(255,255,255,0.65)", glassStrongBg: "rgba(255,255,255,0.78)", glassElevatedBg: "rgba(255,255,255,0.88)",
      glassTintedBg: "rgba(0,0,0,0.04)", glassTintedEdge: "0 0 0 0.5px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.8)",
      glassAccentBg: "rgba(0,112,243,0.10)", glassAccentEdge: "0 0 0 0.5px rgba(0,112,243,0.15), inset 0 0.5px 0 rgba(0,112,243,0.12)",
      text: "#000000", textSecondary: "rgba(0,0,0,0.6)", textTertiary: "rgba(0,0,0,0.3)", textMuted: "rgba(0,0,0,0.15)",
      border: "rgba(0,0,0,0.07)", borderStrong: "rgba(0,0,0,0.15)",
    },
  },
  "vercel-geist": {
    name: "Geist",
    icon: "◇",
    dark: {
      bg: "#0A0A0A", bgSecondary: "#141414", bgElevated: "#1A1A1A",
      brand: "#FFFFFF", brand500: "#FFFFFF",
      accent: "#7928CA", accent500: "#6B21A8",
      glassBg: "rgba(26,26,26,0.62)", glassStrongBg: "rgba(34,34,34,0.72)", glassElevatedBg: "rgba(44,44,44,0.82)",
      glassTintedBg: "rgba(255,255,255,0.08)", glassTintedEdge: "0 0 0 0.5px rgba(255,255,255,0.12), inset 0 0.5px 0 rgba(255,255,255,0.15)",
      glassAccentBg: "rgba(121,40,202,0.14)", glassAccentEdge: "0 0 0 0.5px rgba(121,40,202,0.18), inset 0 0.5px 0 rgba(121,40,202,0.20)",
      text: "#FFFFFF", textSecondary: "rgba(255,255,255,0.7)", textTertiary: "rgba(255,255,255,0.4)", textMuted: "rgba(255,255,255,0.2)",
      border: "rgba(255,255,255,0.06)", borderStrong: "rgba(255,255,255,0.12)",
    },
    light: {
      bg: "#FFFFFF", bgSecondary: "#FAFAFA", bgElevated: "#FFFFFF",
      brand: "#000000", brand500: "#000000",
      accent: "#7928CA", accent500: "#6B21A8",
      glassBg: "rgba(255,255,255,0.65)", glassStrongBg: "rgba(255,255,255,0.78)", glassElevatedBg: "rgba(255,255,255,0.88)",
      glassTintedBg: "rgba(0,0,0,0.04)", glassTintedEdge: "0 0 0 0.5px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.8)",
      glassAccentBg: "rgba(121,40,202,0.10)", glassAccentEdge: "0 0 0 0.5px rgba(121,40,202,0.15), inset 0 0.5px 0 rgba(121,40,202,0.12)",
      text: "#000000", textSecondary: "rgba(0,0,0,0.6)", textTertiary: "rgba(0,0,0,0.3)", textMuted: "rgba(0,0,0,0.15)",
      border: "rgba(0,0,0,0.07)", borderStrong: "rgba(0,0,0,0.15)",
    },
  },
}

export interface ThemeConfig {
  mode: "dark" | "light"
  brandColor: string
  accentColor: string
  preset: ThemePresetName
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
