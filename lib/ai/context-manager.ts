import { AI_CONFIG } from "./config"
import type { JarvisMessage } from "../jarvis-types"

/**
 * Estimate token count from string.
 * Uses a standard 0.38 tokens-per-char ratio for English text.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length * AI_CONFIG.TOKENS_PER_CHAR)
}

export interface BudgetedContext {
  systemPrompt: string
  history: JarvisMessage[]
  trimmedHistoryCount: number
  totalTokens: number
  tokenBreakdown: {
    systemPrompt: number
    history: number
    responseReserve: number
  }
}

/**
 * Assembles a context window respecting the token budget.
 *
 * Priority ordering (highest first):
 * 1. System prompt (up to SYSTEM_PROMPT_MAX)
 * 2. Recent history (last N turns up to TURN_BUFFER_MAX)
 * 3. Middle history (summarized / trimmed if over budget)
 * 4. Response reserve (RESPONSE_RESERVE always kept)
 */
export function buildContextWithBudget(
  systemPrompt: string,
  history: JarvisMessage[]
): BudgetedContext {
  const tokenBreakdown = {
    systemPrompt: 0,
    history: 0,
    responseReserve: AI_CONFIG.RESPONSE_RESERVE,
  }

  const systemTokens = estimateTokens(systemPrompt)
  tokenBreakdown.systemPrompt = systemTokens

  const availableForHistory =
    AI_CONFIG.CONTEXT_BUDGET - systemTokens - AI_CONFIG.RESPONSE_RESERVE

  if (availableForHistory <= 0) {
    return {
      systemPrompt: systemPrompt.slice(0, Math.floor(AI_CONFIG.SYSTEM_PROMPT_MAX / AI_CONFIG.TOKENS_PER_CHAR)),
      history: [],
      trimmedHistoryCount: history.length,
      totalTokens: systemTokens + AI_CONFIG.RESPONSE_RESERVE,
      tokenBreakdown: {
        ...tokenBreakdown,
        systemPrompt: Math.min(systemTokens, AI_CONFIG.SYSTEM_PROMPT_MAX),
        history: 0,
      },
    }
  }

  // Build from most recent messages backwards
  const budgetedHistory: JarvisMessage[] = []
  let historyTokens = 0

  for (let i = history.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(history[i].content || "")
    if (historyTokens + msgTokens > availableForHistory) break
    historyTokens += msgTokens
    budgetedHistory.unshift(history[i])
  }

  tokenBreakdown.history = historyTokens

  const trimmedCount = history.length - budgetedHistory.length

  return {
    systemPrompt,
    history: budgetedHistory,
    trimmedHistoryCount: trimmedCount,
    totalTokens: systemTokens + historyTokens + AI_CONFIG.RESPONSE_RESERVE,
    tokenBreakdown,
  }
}
