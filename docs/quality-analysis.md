# Quality Analysis

## 1. Performance

### 1.1 First Load JS (production build)
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| First Load JS (shared) | 87.7 kB | <100 kB | ✅ |
| Largest page (sleep) | 315 kB | <350 kB | ✅ |
| Smallest page (_not-found) | 88.5 kB | <100 kB | ✅ |
| Middleware | 47.5 kB | — | OK |

### 1.2 API Route Latency (estimated)
| Route | Expected p95 | Bottleneck |
|-------|-------------|------------|
| POST /api/jarvis/chat | ~500ms + LLM time | LLM response (varies by model/provider) |
| POST /api/jarvis/memories | <100ms | Supabase insert + poisoning check |
| GET /api/jarvis/sessions | <50ms | Supabase query |
| POST /api/jarvis/embeddings | <200ms | Embedding API call |

### 1.3 Token Budgeting (new)
- Context window: 8,000 tokens (configurable in `lib/ai/config.ts`)
- System prompt: ~800 tokens max
- History: up to ~5,200 tokens (turns trimmed oldest-first when over budget)
- Response reserve: 2,000 tokens guaranteed
- Previous behavior: unbounded history → possible token overflow + API errors

### 1.4 Memory Usage
- Injection tracker: Map<string, {count, hourStart}> — negligible, auto-resets hourly
- Tool registry: Map<string, ToolCallRecord> — negligible, per-server
- Rate limiter: Map<string, {count, resetAt}> — trimmed on reset

### 1.5 Bundle Impact of New Code
All new `lib/ai/` modules are server-side only (API routes) — zero client bundle impact.
The one change to `lib/jarvis-store.ts` (client) is a new string field in a JSON body — no new imports.

---

## 2. Testing

### 2.1 Test Coverage Gaps (Current)
| Area | Coverage | Risk |
|------|----------|------|
| AI executor (SSE parsing) | None | Medium — LLM output format changes could break streaming |
| Context manager (token budgeting) | None | Low — math is straightforward |
| System prompt assembly | None | Low — pure string concatenation |
| Sanitize (injection detection) | None | High — regex misses = security hole |
| Poisoning detection | None | High — false positives block legitimate input |
| Tool router (rate limits) | None | Medium — race conditions possible |
| Chat route integration | None | Medium — regression risk on refactors |

### 2.2 Recommended Test Strategy
```
tests/
  ai/
    sanitize.test.ts        # injection patterns, edge cases, unicode
    poisoning.test.ts       # false positive rate, confidence scoring
    context-manager.test.ts # token budget enforcement, priority ordering
    executor.test.ts        # SSE stream parsing, tool call detection
    system-prompt.test.ts   # section assembly, injection fence
    tool-router.test.ts     # rate limits, circuit breaker, whitelist
    config.test.ts          # all constants have valid values
```

### 2.3 Testing Priority
| Priority | Area | Why |
|----------|------|-----|
| P0 | sanitize.ts | Security-critical — regex correctness |
| P0 | poisoning.ts | Security-critical — false positives/negatives |
| P1 | executor.ts | Core streaming — regression if LLM API changes format |
| P1 | context-manager.ts | Budget enforcement — prevents token overflow |
| P2 | tool-router.ts | Rate limit correctness — prevents abuse |
| P2 | system-prompt.ts | Section ordering — functional correctness |

### 2.4 Manual Regression Test Plan
1. Send a normal chat message → expect streaming response
2. Send an injection attempt ("ignore all previous instructions") → expect 400 + no LLM call
3. Call a memory tool (e.g., "add memory: X") → expect memories route to check poisoning
4. Rapid-fire messages (61+ in 1 min) → expect 429 on the 61st
5. Repeated injection attempts (6+) → expect account temporarily restricted
6. Long history (100+ messages) → expect context window trimming, no errors

---

## 3. Architectural Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Separate `memoriesSection` from `lifeContext` | Both are contextual, but memories are retrieved via semantic similarity while life context is real-time metrics | Phase 4 |
| Token budget at 8000 (not 4096 or 16384) | 8k fits all common models (GPT-4o-mini, Llama 3, Claude Haiku) with room for history + response | Phase 4 |
| Injection patterns → hard block (not soft flag) | Safer to false-positive than to allow injection through | Phase 3 |
| Per-tool rate limits in config, not DB | Config is immutable per deploy, avoids a DB read on every tool call | Phase 3 |
| Circuit breaker on consecutive failures | Prevents cascading failures if a tool starts erroring | Phase 3 |
| Modular prompt sections | Enables per-section testing, easy additions, easier review of security section | Phase 4 |
| Executor extracted from chat route | SSE parsing is the most likely breakage point — isolating it enables unit testing | Phase 4 |

---

## 4. Known Limitations

1. **Token estimation is approximate** — uses char count * 0.38, not a tokenizer. For models with expensive tokenizers (e.g., Claude), this may over-allow. Mitigation: the estimate is conservative (0.38 is below real avg for English).

2. **Rate limiting is per-server** — the in-memory Map doesn't scale across multiple instances. Mitigation: acceptable for single-server deployment. If scaling horizontally, swap to Redis (the interface is simple enough).

3. **No embedding-based memory retrieval** — `getSimilarMemories` in `memory-engine.ts` uses keyword matching, not semantic search. The embeddings API exists (`/api/jarvis/embeddings`) but is not wired. Mitigation: Phase 4 (Sprint 4 in the implementation roadmap).

4. **Injection detection is regex-based** — sophisticated prompt injections using obfuscation or encoding may bypass. Mitigation: the injection fence delimiter is the primary defense; pattern detection is secondary.

5. **`jarvis-context.ts` still contains duplicate system prompt building** — kept for backward compat with `AIRecommendations` and `JarvisInsightBar`. Will be consolidated when those components are migrated to the new system.

---

## 5. Future Roadmap

### Short-term (next 2 weeks)
- [ ] Write unit tests for sanitize.ts and poisoning.ts (P0)
- [ ] Wire embeddings API into memory retrieval for semantic search
- [ ] Migrate AIRecommendations + JarvisInsightBar to use `lib/ai/prompts/system.ts`
- [ ] Add Redis-backed rate limiting for horizontal scale

### Medium-term (next month)
- [ ] Implement Planner → Executor → Critic → Reflection agent loop (Sprint 3)
- [ ] Add feedback tracking and mistake logging
- [ ] Add response quality scoring dashboard
- [ ] Implement memory update from user corrections

### Long-term (next quarter)
- [ ] Multi-tenant support (organization accounts)
- [ ] Fine-tuned model for LifeOS-specific tasks
- [ ] On-device inference for voice commands
- [ ] Federated memory across devices
