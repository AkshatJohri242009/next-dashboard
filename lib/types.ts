export interface Goal {
  text: string
  done: boolean
  queued?: boolean
  pushedCount?: number
  doneAt?: number
  reminderMin?: number
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
}

export interface WeightEntry {
  date: string
  weight: number
  note?: string
}

export type Page = 'main' | 'health' | 'gym' | 'weight'
