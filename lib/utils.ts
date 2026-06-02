import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pad(n: number): string {
  return String(n).padStart(2, "0")
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function getActiveDateString(): string {
  const now = new Date()
  return toDateString(now.getHours() < 6 ? addDays(now, -1) : now)
}

export function getTomorrowDateString(): string {
  const now = new Date()
  return toDateString(now.getHours() < 6 ? now : addDays(now, 1))
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function keyFor(dateString: string): string {
  return `goals:${dateString}`
}

export function todayKey(): string {
  return keyFor(getActiveDateString())
}

export function tomorrowKey(): string {
  return keyFor(getTomorrowDateString())
}

export function minutesText(minutes: number): string {
  const safe = Math.max(0, Math.ceil(minutes))
  const h = Math.floor(safe / 60)
  const m = safe % 60
  return `${h}h ${m}m`
}

export function interpolateColor(percent: number): string {
  const stops: [number, number[]][] = [
    [0, [255, 216, 158]],
    [12.5, [255, 205, 121]],
    [25, [255, 227, 143]],
    [37.5, [255, 183, 106]],
    [50, [255, 149, 89]],
    [62.5, [243, 111, 79]],
    [75, [226, 93, 122]],
    [87.5, [123, 91, 176]],
    [100, [47, 58, 102]],
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const [aPct, aRgb] = stops[i]
    const [bPct, bRgb] = stops[i + 1]
    if (percent >= aPct && percent <= bPct) {
      const t = (percent - aPct) / (bPct - aPct)
      const rgb = aRgb.map((value, idx) => Math.round(value + (bRgb[idx] - value) * t))
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    }
  }
  return "rgb(47, 58, 102)"
}

export function parseReps(text: string): number[] {
  return text.split(",").map(r => Number(r.trim())).filter(Number.isFinite)
}

export function targetHit(log: { sets: number; reps: number[] }): boolean {
  return log.reps.length >= log.sets && log.reps.slice(0, log.sets).every(r => r >= 8)
}

export function waterGoalMl(state: {
  weight: number; age: number; activity: number;
  caffeine: number; stimulants: number
}): number {
  const weightBase = (state.weight || 70) * 35
  const activityBoost = (state.activity || 0) * 650
  const caffeineBoost = Math.max(0, (state.caffeine || 0) / 100) * 120
  const stimBoost = (state.stimulants || 0) * 200
  const ageAdjustment = (state.age || 18) > 45 ? 150 : 0
  return Math.round(weightBase + activityBoost + caffeineBoost + stimBoost + ageAdjustment)
}

export function computePeakWindow(sleep: number, waterPct: number): number {
  const sleepScore = Math.min(1, sleep / 8)
  const timeScore = 0.7
  const peak = Math.round((sleepScore * 0.45 + waterPct * 0.25 + timeScore * 0.30) * 100)
  return Math.max(0, Math.min(100, peak))
}

const CURRENCY_MAP: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥",
  HKD: "HK$", SGD: "S$", AUD: "A$", CAD: "C$", CHF: "CHF",
  KRW: "₩", BRL: "R$", MXN: "MX$", RUB: "₽", ZAR: "R",
  SEK: "kr", NOK: "kr", DKK: "kr", NZD: "NZ$", TWD: "NT$",
  THB: "฿", IDR: "Rp", MYR: "RM", PHP: "₱", VND: "₫",
}

export function currencySymbol(currency?: string): string {
  return CURRENCY_MAP[currency?.toUpperCase() || ""] || "$"
}

export function loadJSON<T = any>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") as T }
  catch { return null }
}

export function saveJSON<T = any>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}
