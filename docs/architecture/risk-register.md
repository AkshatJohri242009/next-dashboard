# Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R1 | New agent architecture breaks existing chat flow | Medium | High | Phase implementation: ship with feature flag, A/B test before full rollout |
| R2 | Memory writes cause latency on main response path | Medium | Medium | All memory writes are async (fire-and-forget) |
| R3 | Critic scoring blocks responses (false negatives) | Medium | Low | Max 2 retries, then deliver best effort. Threshold configurable. |
| R4 | Embedding API costs exceed budget | Medium | Medium | Cache embeddings, batch writes, fall back to keyword search |
| R5 | Context manager trims important content | Low | Medium | Priority ordering: user message and system prompt are never trimmed |
| R6 | Tool router adds latency to tool calls | Low | Low | Router is synchronous, lightweight validation only |
| R7 | Session memory (Redis) unavailable | Low | Medium | In-memory Map fallback (same pattern as jarvis-db) |
| R8 | Prompt injection bypasses fence | Medium | High | Defense in depth: injection fence + output validation + rate limiting |
| R9 | Agent loops (Planner → Executor → Critic infinite cycle) | Low | High | Hard max 3 cycles per turn, circuit breaker |
| R10 | Reflection engine writes bad data to memory | Low | Medium | Poisoning prevention validates all writes. Human-in-loop for importance > 0.8 |
| R11 | New code increases First Load JS | Medium | Medium | Lazy-load all new modules, tree-shake unused code |
| R12 | Tool router blocks existing tools (regression) | Low | High | All existing 8 tools whitelisted by default. Tests required before deploy |
