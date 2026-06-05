import { AI_CONFIG } from "../config"

/**
 * Patterns that indicate attempted memory poisoning.
 * Users trying to store instructions disguised as memories.
 */
const POISONING_PATTERNS: RegExp[] = [
  /forget all (previous |)instructions/i,
  /overwrite your (system |)prompt/i,
  /from now on you are/i,
  /ignore everything (above|before|below)/i,
  /you are not (jarvis|an ai|a bot)/i,
  /system (prompt|message|instruction).*(override|change|ignore)/i,
  /treat (this|the following) as (a |)system (prompt|message|instruction)/i,
]

export interface PoisonCheckResult {
  safe: boolean
  confidence: number
  reason: string | null
  flagged: boolean
}

/**
 * Check if content is safe to write to memory.
 * Returns confidence score (0-1) and whether to flag or block.
 */
export function checkMemoryPoisoning(text: string): PoisonCheckResult {
  const lower = text.toLowerCase()

  // Length check
  if (text.length > AI_CONFIG.MEMORY_MAX_LENGTH) {
    return { safe: false, confidence: 1.0, reason: "Exceeds max length", flagged: true }
  }

  // Check against known poisoning patterns
  let maxConfidence = 0
  let matchedReason: string | null = null

  for (const pattern of POISONING_PATTERNS) {
    const match = lower.match(pattern)
    if (match) {
      // Confidence based on match length relative to text length
      const matchLength = match[0].length
      const confidence = Math.min(1.0, matchLength / text.length * 3)
      if (confidence > maxConfidence) {
        maxConfidence = confidence
        matchedReason = `Matched poisoning pattern: ${pattern.source.slice(0, 60)}`
      }
    }
  }

  // Check for unusually high density of instruction-like language
  const instructionWords = ["ignore", "override", "forget", "system", "prompt", "instruction", "rule", "directive", "you are", "you must"]
  const instructionCount = instructionWords.filter(w => lower.includes(w)).length
  if (text.split(/\s+/).length > 0) {
    const density = instructionCount / text.split(/\s+/).length
    if (density > 0.3) {
      const confidence = Math.min(1.0, density * 1.5)
      if (confidence > maxConfidence) {
        maxConfidence = confidence
        matchedReason = "High density of instruction-like language"
      }
    }
  }

  if (maxConfidence >= AI_CONFIG.MEMORY_BLOCK_THRESHOLD) {
    return { safe: false, confidence: maxConfidence, reason: matchedReason, flagged: true }
  }

  if (maxConfidence >= AI_CONFIG.MEMORY_FLAG_THRESHOLD) {
    return { safe: true, confidence: maxConfidence, reason: matchedReason, flagged: true }
  }

  return { safe: true, confidence: 0, reason: null, flagged: false }
}

/**
 * Sanitize memory text before storage.
 * Strips control chars, normalizes Unicode, trims.
 */
export function sanitizeMemoryText(text: string): string {
  let clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
  clean = clean.normalize("NFKC")
  clean = clean.trim()
  if (clean.length > AI_CONFIG.MEMORY_MAX_LENGTH) {
    clean = clean.slice(0, AI_CONFIG.MEMORY_MAX_LENGTH)
  }
  return clean
}
