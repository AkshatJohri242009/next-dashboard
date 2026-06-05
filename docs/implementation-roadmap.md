# Implementation Roadmap

## Sprint 1 — Core Foundation (priority: HIGH)

**Goal:** Working new agent with context management, no regressions.

### Files to Create
| File | Purpose |
|------|---------|
| `lib/ai/config.ts` | All constants (token budgets, limits, thresholds, model names) |
| `lib/ai/prompts/system.ts` | Master system prompt assembly |
| `lib/ai/prompts/sections/*.ts` | 8 individual prompt sections |
| `lib/ai/prompts/injection-fence.ts` | User content delimiter |
| `lib/ai/context-manager.ts` | Context window assembly + token budgeting |
| `lib/ai/executor.ts` | LLM call + SSE stream handler |
| `lib/ai/logger.ts` | Structured logging |

### Files to Modify
| File | Change |
|------|--------|
| `app/api/jarvis/chat/route.ts` | Use new context-manager, executor, inject fence |
| `lib/jarvis-store.ts` | Wire sendMessage through new executor |
| `lib/jarvis-context.ts` | Remove duplicate context building, delegate to context-manager |

### Tests
- Context manager: verify budget enforcement, priority ordering
- Executor: verify SSE stream parsing, tool call detection
- System prompt: verify all sections included, injection fence present

### Acceptance Criteria
- [ ] Chat still streams responses for all 8 existing tool types
- [ ] No regression in voice commands, briefings, or memory UI
- [ ] Context window is assembled with proper priority ordering
- [ ] Injection fence wraps all user content
- [ ] Build passes with no new warnings

---

## Sprint 2 — Memory System (priority: HIGH)

**Goal:** Five-tier memory system operational.

### Files to Create
| File | Purpose |
|------|---------|
| `lib/ai/memory/index.ts` | Memory facade |
| `lib/ai/memory/session.ts` | Tier 2 — Redis session memory |
| `lib/ai/memory/long-term.ts` | Tier 3 — Supabase |
| `lib/ai/memory/project.ts` | Tier 4 — Project memory |
| `lib/ai/memory/global.ts` | Tier 5 — Static KB |
| `lib/ai/memory/importance.ts` | Importance scoring |
| `lib/ai/memory/dedup.ts` | Deduplication |
| `lib/ai/memory/poisoning.ts` | Input validation |

### Files to Modify
| File | Change |
|------|--------|
| `lib/jarvis-db.ts` | Add new memory query methods |
| `lib/memory-engine.ts` | Mark deprecated, delegate to new system |
| `app/api/jarvis/memories/route.ts` | Add importance scoring, dedup |

### Acceptance Criteria
- [ ] Memories written from chat appear in memory UI
- [ ] Semantic retrieval returns relevant memories (not just keyword)
- [ ] Dedup prevents duplicate entries
- [ ] Poisoning detection blocks known injection patterns
- [ ] Importance scores are computed and stored

---

## Sprint 3 — Agent Architecture (priority: HIGH)

**Goal:** Planner, Executor, Critic, Reflection all operational.

### Files to Create
| File | Purpose |
|------|---------|
| `lib/ai/agent.ts` | Agent orchestrator |
| `lib/ai/planner.ts` | Plan decomposition |
| `lib/ai/critic.ts` | Response scoring |
| `lib/ai/reflection.ts` | Post-turn processing |

### Files to Modify
| File | Change |
|------|--------|
| `app/api/jarvis/chat/route.ts` | Use agent orchestrator |
| `lib/jarvis-store.ts` | Wire through agent |

### Acceptance Criteria
- [ ] Complex requests trigger Planner
- [ ] Critic scores responses, triggers retry if < threshold
- [ ] Reflection writes summary + facts after each turn
- [ ] Self-correction loop maxes at 2 retries

---

## Sprint 4 — RAG Pipeline (priority: MEDIUM)

### Files to Create
| File | Purpose |
|------|---------|
| `lib/ai/rag/index.ts` | RAG facade |
| `lib/ai/rag/chunker.ts` | Text chunking |
| `lib/ai/rag/embedder.ts` | Embedding generation |
| `lib/ai/rag/retriever.ts` | Hybrid retrieval |

### Files to Modify
| File | Change |
|------|--------|
| `app/api/jarvis/embeddings/route.ts` | Use new embedder |
| `app/api/jarvis/documents/route.ts` | Trigger indexing on create |

### Acceptance Criteria
- [ ] New documents are chunked and indexed automatically
- [ ] Hybrid retrieval returns relevant chunks
- [ ] Embeddings cache prevents redundant API calls

---

## Sprint 5 — Security (priority: MEDIUM)

### New File
| File | Purpose |
|------|---------|
| `lib/ai/sanitize.ts` | Input sanitization + output validation |

### Changes
- Add rate limiting to chat route (use existing `lib/rate-limit.ts`)
- Add permission checks to tool router
- Implement rate limiting per-tool

### Acceptance Criteria
- [ ] Injection fence passes known prompt injection tests
- [ ] Rate limiting blocks >60 req/min per user
- [ ] Tool calls validate against whitelist

---

## Sprint 6 — Polish + Self-Improvement (priority: LOW)

- Feedback tracking system
- Mistake logging
- Response quality scoring dashboard
- Memory update from user corrections
