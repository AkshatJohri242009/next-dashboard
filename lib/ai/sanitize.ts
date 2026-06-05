import { AI_CONFIG } from "./config"

/**
 * Injection pattern regexes.
 * Matches prompts that attempt to override system instructions.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /(ignore|disregard|forget|override)\s.*(previous|above|all|system).*(instructions|prompt|rules)/i,
  /you are now (an?|the) .{0,50}(not |instead)/i,
  /system.*(prompt|message|instruction).*(:|is)/i,
  /from now on you are/i,
  /ignore everything (above|before|below)/i,
  /overwrite your (system |)prompt/i,
  /forget all previous instructions/i,
]

export interface SanitizeResult {
  clean: string
  blocked: boolean
  reason: string | null
  injected: boolean
}

/**
 * Sanitize user input before sending to LLM.
 * Strips control chars, validates length, checks injection patterns.
 */
export function sanitizeInput(raw: string): SanitizeResult {
  if (!raw || typeof raw !== "string") {
    return { clean: "", blocked: true, reason: "Empty input", injected: false }
  }

  // Strip null bytes and control characters (keep \n, \t, \r)
  let clean = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  // Normalize Unicode (NFKC to reduce homograph attacks)
  clean = clean.normalize("NFKC")

  // Trim
  clean = clean.trim()

  if (clean.length === 0) {
    return { clean: "", blocked: true, reason: "Empty after sanitization", injected: false }
  }

  if (clean.length > AI_CONFIG.MAX_USER_MESSAGE_LENGTH) {
    clean = clean.slice(0, AI_CONFIG.MAX_USER_MESSAGE_LENGTH)
  }

  // Check injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        clean,
        blocked: true,
        reason: "Message blocked: potential prompt injection detected",
        injected: true,
      }
    }
  }

  return { clean, blocked: false, reason: null, injected: false }
}
