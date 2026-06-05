// All magic numbers, thresholds, and limits for the AI system.
// Every constant has a rationale comment.

export const AI_CONFIG = {
  // ---- Context Window ----
  CONTEXT_BUDGET: 8_000, // tokens: total context window per turn
  SYSTEM_PROMPT_MAX: 800, // tokens: system prompt core
  MEMORIES_MAX: 500, // tokens: injected memories
  SESSION_SUMMARY_MAX: 400, // tokens: compressed session summary
  TURN_BUFFER_MAX: 1_000, // tokens: last N turns raw
  LIFEOS_DATA_MAX: 300, // tokens: real-time LifeOS metrics
  RESPONSE_RESERVE: 2_000, // tokens: guaranteed for the assistant's reply

  // ---- Token Estimation ----
  TOKENS_PER_CHAR: 0.38, // avg for English text
  TOOLS_TOKENS_PER_DEF: 50, // per tool definition in the tools array

  // ---- Message Limits ----
  MAX_USER_MESSAGE_LENGTH: 4_000, // chars: max user input

  // ---- Agent ----
  MAX_PLAN_STEPS: 5, // max steps Planner can produce
  MAX_EXECUTOR_RETRIES: 2, // max retry cycles from Critic feedback
  CRITIC_THRESHOLD: 0.6, // min composite score to pass Critic

  // ---- Memory ----
  MEMORY_MAX_LENGTH: 2_000, // chars: max memory value
  MEMORY_RETRIEVAL_TOP_K: 5, // max memories to inject per turn
  MEMORY_ARCHIVE_THRESHOLD: 0.2, // importance below this → archived
  SESSION_SUMMARY_INTERVAL: 5, // turns between summary regenerations

  // ---- Importance Scoring Weights ----
  IMPORTANCE_RECENCY_WEIGHT: 0.3,
  IMPORTANCE_FREQUENCY_WEIGHT: 0.2,
  IMPORTANCE_SOURCE_WEIGHT: 0.2,
  IMPORTANCE_USER_WEIGHT: 0.3,

  // ---- Rate Limiting ----
  RATE_LIMIT_CHAT_PER_MIN: 60, // requests per minute per user
  RATE_LIMIT_CHAT_CONCURRENT: 10, // max concurrent streams per user
  RATE_LIMIT_TOOL_COOLDOWN_MS: 1_000, // default: 1s between same tool calls
  TOOL_MAX_FAILURES_BEFORE_DISABLE: 5, // circuit breaker threshold
  TOOL_DISABLE_DURATION_MS: 60_000, // circuit breaker cooldown

  // ---- Per-Tool Rate Limits ----
  TOOL_RATE_LIMITS: {
    addGoal: { maxPerHour: 30, cooldownMs: 2_000 },
    toggleGoal: { maxPerHour: 60, cooldownMs: 1_000 },
    deleteGoal: { maxPerHour: 20, cooldownMs: 5_000 },
    logWater: { maxPerHour: 60, cooldownMs: 1_000 },
    logHabit: { maxPerHour: 30, cooldownMs: 2_000 },
    journalEntry: { maxPerHour: 20, cooldownMs: 5_000 },
    getGoals: { maxPerHour: 120, cooldownMs: 500 },
    getContext: { maxPerHour: 120, cooldownMs: 500 },
  } as Record<string, { maxPerHour: number; cooldownMs: number }>,

  // ---- Security ----
  MAX_INJECTION_ATTEMPTS_PER_HOUR: 5, // block user after this many injection attempts
  MEMORY_FLAG_THRESHOLD: 0.7, // poisoning detection confidence → flag
  MEMORY_BLOCK_THRESHOLD: 0.95, // poisoning detection confidence → block
} as const
