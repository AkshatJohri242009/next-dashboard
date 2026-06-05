import { AI_CONFIG } from "./config"

/**
 * Whitelist of allowed tool names.
 * Any tool call not in this list is rejected before execution.
 */
const TOOL_WHITELIST = new Set([
  "addGoal", "toggleGoal", "deleteGoal", "logWater",
  "logHabit", "journalEntry", "getGoals", "getContext",
])

interface ToolCallRecord {
  name: string
  lastCalledAt: number
  callCount: number
  hourStart: number
  consecutiveFailures: number
  disabledUntil: number
}

/**
 * In-memory tool call registry for rate limiting + circuit breaker.
 * In production, this would be in Redis.
 */
const toolRegistry = new Map<string, ToolCallRecord>()

function getRecord(name: string): ToolCallRecord {
  if (!toolRegistry.has(name)) {
    toolRegistry.set(name, {
      name,
      lastCalledAt: 0,
      callCount: 0,
      hourStart: Date.now(),
      consecutiveFailures: 0,
      disabledUntil: 0,
    })
  }
  return toolRegistry.get(name)!
}

export interface ToolRouteResult {
  allowed: boolean
  reason: string | null
}

/**
 * Validate a tool call before execution.
 * Checks: whitelist, rate limits, cooldown, circuit breaker.
 */
export function validateToolCall(name: string): ToolRouteResult {
  // 1. Whitelist check
  if (!TOOL_WHITELIST.has(name)) {
    return { allowed: false, reason: `Unknown tool: "${name}". Allowed: ${Array.from(TOOL_WHITELIST).join(", ")}` }
  }

  const limits = AI_CONFIG.TOOL_RATE_LIMITS[name]
  if (!limits) {
    return { allowed: true, reason: null } // no limits defined → allowed
  }

  const rec = getRecord(name)
  const now = Date.now()

  // 2. Circuit breaker
  if (rec.disabledUntil > now) {
    const remaining = Math.ceil((rec.disabledUntil - now) / 1000)
    return { allowed: false, reason: `Tool "${name}" temporarily disabled (${remaining}s cooldown due to failures)` }
  }

  // 3. Cooldown
  if (now - rec.lastCalledAt < limits.cooldownMs) {
    const remaining = Math.ceil((limits.cooldownMs - (now - rec.lastCalledAt)) / 1000)
    return { allowed: false, reason: `Tool "${name}" on cooldown (wait ${remaining}s)` }
  }

  // 4. Hourly rate limit
  if (now - rec.hourStart > 3_600_000) {
    rec.hourStart = now
    rec.callCount = 0
  }
  if (rec.callCount >= limits.maxPerHour) {
    return { allowed: false, reason: `Tool "${name}" rate limit reached (${limits.maxPerHour}/hour)` }
  }

  // Update record
  rec.lastCalledAt = now
  rec.callCount++

  return { allowed: true, reason: null }
}

/**
 * Record a tool call failure for circuit breaker tracking.
 */
export function recordToolFailure(name: string): void {
  const rec = getRecord(name)
  rec.consecutiveFailures++
  if (rec.consecutiveFailures >= AI_CONFIG.TOOL_MAX_FAILURES_BEFORE_DISABLE) {
    rec.disabledUntil = Date.now() + AI_CONFIG.TOOL_DISABLE_DURATION_MS
    rec.consecutiveFailures = 0
  }
}

/**
 * Record a tool call success (resets consecutive failure counter).
 */
export function recordToolSuccess(name: string): void {
  const rec = getRecord(name)
  rec.consecutiveFailures = 0
}
