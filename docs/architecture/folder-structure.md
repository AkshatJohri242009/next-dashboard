# Target Folder Structure

```
lib/
├── ai/
│   ├── agent.ts              # Agent orchestrator (Planner → Executor → Critic → Reflection)
│   ├── planner.ts            # Multi-step plan decomposition
│   ├── executor.ts           # LLM call + stream handler
│   ├── critic.ts             # Response quality scoring
│   ├── reflection.ts         # Post-turn summarization + memory extraction
│   ├── context-manager.ts    # Context window assembly + token budgeting
│   ├── tool-router.ts        # Tool call validation + routing + rate limiting
│   ├── memory/               # Memory system (was memory-engine.ts)
│   │   ├── index.ts          # Memory facade (unified API)
│   │   ├── session.ts        # Tier 2 — Redis session memory
│   │   ├── long-term.ts      # Tier 3 — Supabase long-term memory
│   │   ├── project.ts        # Tier 4 — Project memory
│   │   ├── global.ts         # Tier 5 — Static knowledge base
│   │   ├── importance.ts     # Importance scoring formula
│   │   ├── dedup.ts          # Deduplication logic
│   │   └── poisoning.ts      # Input validation + injection detection
│   ├── rag/
│   │   ├── index.ts          # RAG pipeline facade
│   │   ├── chunker.ts        # Text chunking (recursive split)
│   │   ├── embedder.ts       # Embedding generation (OpenAI)
│   │   └── retriever.ts      # Hybrid BM25 + semantic retrieval
│   ├── prompts/
│   │   ├── system.ts         # System prompt assembly
│   │   ├── sections/         # Individual prompt sections
│   │   │   ├── identity.ts
│   │   │   ├── reasoning.ts
│   │   │   ├── tools.ts
│   │   │   ├── output.ts
│   │   │   ├── honesty.ts
│   │   │   ├── memory.ts
│   │   │   ├── hallucination.ts
│   │   │   └── persona.ts
│   │   └── injection-fence.ts # User content delimiter wrapper
│   ├── config.ts             # All constants: token budgets, thresholds, limits
│   └── logger.ts             # Structured logging for AI subsystem

app/api/ai/                    # New consolidated API route
└── chat/
    └── route.ts              # Single chat endpoint (replaces /api/jarvis/chat)

# Existing files that need modification:
lib/jarvis-store.ts           # Update to use new agent system
lib/jarvis-context.ts          # Simplify → delegate to context-manager
lib/jarvis-tools.ts            # Keep but route through tool-router
lib/jarvis-tool-defs.ts        # Keep but enhance with categories
lib/memory-engine.ts           # Deprecated → use lib/ai/memory/
lib/jarvis-db.ts               # Keep for now (will be abstracted)

# New config file:
lib/ai/config.ts               # All magic numbers → named constants
```
