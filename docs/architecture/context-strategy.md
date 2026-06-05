# Context Window Strategy

## Assembly Order (per turn)

```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT CORE (800 tokens, fixed)                          │
│ ├─ Identity declaration                                         │
│ ├─ Behavior rules                                               │
│ ├─ Tool usage rules                                             │
│ ├─ Output format rules                                          │
│ └─ Anti-hallucination guard                                     │
├─────────────────────────────────────────────────────────────────┤
│ INJECTED MEMORIES (500 tokens, dynamic)                         │
│ ├─ Top-3 Long-Term Memories (semantic similarity)               │
│ ├─ Top-2 Project Memories (if available)                        │
│ └─ Top-1 Global Knowledge (if keyword match)                    │
├─────────────────────────────────────────────────────────────────┤
│ SESSION SUMMARY (400 tokens, compressed)                        │
│ ├─ Current session summary from Redis                           │
│ └─ Key facts / decisions / open tasks                           │
├─────────────────────────────────────────────────────────────────┤
│ RECENT TURN BUFFER (1000 tokens, last N turns)                  │
│ ├─ Most recent user ↔ assistant exchanges                      │
│ └─ Older turns → excluded when budget exceeded                  │
├─────────────────────────────────────────────────────────────────┤
│ LIFEOS DATA (300 tokens, dynamic)                               │
│ ├─ Goals / Health / Gym / Sleep / Habits / Study                │
│ └─ Page-specific context                                        │
├─────────────────────────────────────────────────────────────────┤
│ CURRENT USER MESSAGE (variable)                                 │
├─────────────────────────────────────────────────────────────────┤
│ TOOL RESULTS (variable, only when tools called)                 │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSE BUDGET (2000-4000 tokens reserved)                     │
└─────────────────────────────────────────────────────────────────┘
```

## Total Budget: 8000 tokens (default, configurable)

## Priority Order (when trimming is needed)

| Priority | Section | Action |
|----------|---------|--------|
| 1 (keep) | System Prompt Core | Never trimmed |
| 2 (keep) | Current User Message | Never trimmed |
| 3 | Response Budget | Never trimmed |
| 4 | Tool Results | Kept if present |
| 5 | Injected Memories | Truncate to top-2, then top-1 |
| 6 | LifeOS Data | Remove low-importance metrics |
| 7 | Session Summary | Compress further (200t) |
| 8 (drop) | Recent Turn Buffer | Drop oldest turns first |

## Token Counting Method

```
Tokens ≈ character_count × 0.38 (for English text)
Tools array counted separately: ≈50 tokens per tool definition
```

## Context Assembly Pseudocode

```typescript
function assembleContext(
  systemPrompt: string,
  messages: Message[],
  memories: Memory[],
  sessionSummary: SessionSummary | null,
  lifeData: LifeData,
): Context {
  const budget = 8000
  let used = 0
  
  // Fixed sections
  const core = { text: systemPrompt, tokens: countTokens(systemPrompt) }
  used += core.tokens
  
  // Memories (trimmed to budget)
  const memSection = buildMemorySection(memories, 500)
  if (used + memSection.tokens > budget) trimMemories(memSection, budget - used)
  used += memSection.tokens
  
  // Session summary
  if (sessionSummary) { ... similar trimming }
  
  // Turn buffer (drop oldest if needed)
  const turns = selectRecentTurns(messages, budget - used - responseReserve)
  
  return { system: core, memories: memSection, summary, turns, userMessage }
}
```
