# AI Assistant Architecture — Audit Report

**Date:** 2026-06-06
**Scope:** Full codebase audit of all AI/assistant-related code in LifeOS dashboard

---

## 1. Files Mapped (68 total)

### API Routes (16 files in `app/api/jarvis/`)
| File | Purpose | Lines |
|------|---------|-------|
| `app/api/jarvis/chat/route.ts` | Core chat streaming endpoint (SSE) | 191 |
| `app/api/jarvis/sessions/route.ts` | CRUD for chat sessions | 47 |
| `app/api/jarvis/messages/route.ts` | List messages by session | 15 |
| `app/api/jarvis/memories/route.ts` | CRUD for JARVIS memories | 44 |
| `app/api/jarvis/documents/route.ts` | CRUD for stored documents | 44 |
| `app/api/jarvis/embeddings/route.ts` | Embedding generation + vector search | 128 |
| `app/api/jarvis/setup/route.ts` | One-time DB table setup | 172 |
| `app/api/jarvis/study-plan/route.ts` | AI study plan generator | 113 |
| `app/api/jarvis/voice/command/route.ts` | Voice command NLP parsing | 111 |
| `app/api/jarvis/voice/tts/route.ts` | Text-to-speech proxy | 79 |
| `app/api/jarvis/voice/whisper/route.ts` | Whisper STT proxy | 36 |
| `app/api/jarvis/voice/deepgram/route.ts` | Deepgram STT proxy | 37 |
| `app/api/jarvis/auth/login/route.ts` | JARVIS login | 60 |
| `app/api/jarvis/auth/signup/route.ts` | JARVIS signup | 49 |
| `app/api/jarvis/auth/logout/route.ts` | JARVIS logout | 14 |
| `app/api/jarvis/auth/status/route.ts` | Auth status check | 15 |
| `app/api/chat/route.ts` | Legacy Gemini fallback chat | 62 |

### Utility Libraries (18 files in `lib/`)
| File | Purpose | Lines |
|------|---------|-------|
| `lib/jarvis-store.ts` | Zustand store — all JARVIS client state | 549 |
| `lib/jarvis-types.ts` | TypeScript interfaces | 105 |
| `lib/jarvis-db.ts` | Database abstraction layer (Supabase + in-memory) | 393 |
| `lib/jarvis-auth.ts` | Auth utilities (tokens, cookies) | 75 |
| `lib/jarvis-context.ts` | LifeOS context gathering + system prompt builder | 319 |
| `lib/jarvis-tool-defs.ts` | LLM function tool schemas (8 tools) | 121 |
| `lib/jarvis-tools.ts` | Client-side tool execution engine | 144 |
| `lib/memory-engine.ts` | Client-side localStorage memory engine | 191 |
| `lib/voice.ts` | Web Speech API wrapper | 145 |
| `lib/voice-intents.ts` | Voice command processor | 319 |
| `lib/voice-briefings.ts` | Morning/evening/weekly/monthly briefing generators | 314 |
| `lib/voice-journaling.ts` | NLP-free voice journal parser | 92 |
| `lib/life-engine.ts` | Life OS briefing + life score engine | 269 |
| `lib/future-engine.ts` | Future self projection engine | 183 |
| `lib/correlation-engine.ts` | Pattern discovery engine | 263 |
| `lib/life-report.ts` | Annual life report generator | 162 |
| `lib/forecast-engine.ts` | Forecast/recommendation engine | 73 |
| `lib/automation-engine.ts` | 6 AI-powered automation actions | 245 |
| `lib/rate-limit.ts` | IP-based sliding window rate limiter | 49 |

### Components (16 files)
| File | Purpose | Lines |
|------|---------|-------|
| `components/jarvis/JarvisChat.tsx` | Full chat UI with auth, sessions, streaming, memory, settings | 553 |
| `components/jarvis/JarvisPresence.tsx` | Floating presence indicator | 52 |
| `components/jarvis/VoiceButton.tsx` | Floating voice command FAB | 178 |
| `components/jarvis/VoiceBriefingPanel.tsx` | Briefing viewer + TTS | 204 |
| `components/jarvis/VoiceJournalModal.tsx` | Voice journaling modal | 195 |
| `components/jarvis/MemoryAmplifier.tsx` | Memory browser/manager | 194 |
| `components/jarvis/JarvisSetup.tsx` | DB setup wizard | 111 |
| `components/jarvis/LifeReportCard.tsx` | Annual life report | 140 |
| `components/jarvis/FutureSelfPanel.tsx` | Trajectory projections | 163 |
| `components/jarvis/CorrelationPanel.tsx` | Pattern discovery display | 121 |
| `components/layout/AIPanel.tsx` | Sliding AI panel (Gemini/JARVIS) | 143 |
| `components/home/AIBriefing.tsx` | Home page hero briefing | 109 |
| `components/home/AIRecommendations.tsx` | Contextual recommendations | 59 |
| `components/life/JarvisInsightBar.tsx` | Per-page insight bar | 70 |
| `components/life/AutomationPanel.tsx` | One-click automation actions | ~100 |
| `components/settings/SettingsPanel.tsx` | JARVIS provider/settings panel | 212 |

### Database Schema (4 files)
| File | Lines |
|------|-------|
| `supabase-jarvis-schema.sql` | 142 |
| `supabase/migrations/20260602_rls_policies.sql` | 190 |
| `scripts/jarvis-setup.js` | 27 |
| `scripts/run-migration.js` | 40 |

### Other
- `app/ClientLayout.tsx` — Initializes JARVIS auth, auto-extract memories, proactive alerts
- `AGENTS.md` — Architecture documentation

---

## 2. Current LLM Provider & API Call Structure

- **Primary provider:** Groq (default) via OpenAI-compatible REST API
- **Fallback:** Local OpenJarvis server at `http://127.0.0.1:8000`
- **Supported providers:** OpenAI, Ollama, Anthropic, Gemini, Groq (via SettingsPanel)
- **Default model:** `llama-3.3-70b-versatile`
- **Legacy chat:** Google Gemini (`app/api/chat/route.ts` used by AIPanel)
- **API structure:** SSE streaming from `POST /api/jarvis/chat` → forward to LLM provider → stream back

**Weakness:** Single-model per session. No model routing or fallback chain. If the primary model fails, no retry with different model.

---

## 3. Conversation History

- **Storage:** `jarvis_messages` table in Supabase (or in-memory Map fallback)
- **Schema:** `{ id, session_id, role, content, metadata, created_at }`
- **Retrieval:** Full history loaded per session via `listMessages(sessionId)` — no truncation or summary
- **Passing to LLM:** All messages are loaded into the context window sequentially

**Weakness:** No context window management. As conversations grow, every message is sent to the LLM. No session summary/compression. A 100-message conversation sends all 100 messages every turn.

---

## 4. Tool/Function Calling

- **8 tools defined:** addGoal, toggleGoal, deleteGoal, logWater, logHabit, journalEntry, getGoals, getContext
- **Format:** OpenAI-compatible `tools` array in the request body
- **Execution:** Client-side only (`jarvis-tools.ts`) — reads/writes localStorage directly
- **Flow:** Stream detects `tool_calls` delta → pauses stream → executes tool → sends follow-up request with result → streams second response
- **No tool chaining** — only one tool call per turn

**Weakness:** Tools execute in the browser with no server-side validation, no permission model, no audit trail. Tool definitions are hardcoded with no dynamic registration. No whitelist-based routing.

---

## 5. System Prompt

- **Builder:** `buildSystemPrompt()` in `lib/jarvis-context.ts`
- **Structure:** Static preamble + LifeOS context dump (goals, health, gym, sleep, study, etc.)
- **Override:** Users can override via SettingsPanel (stored in session.system_prompt)
- **Injection:** Concatenated with `lifeContext` parameter on the client side

**Weakness:** No structured system prompt with sections. Context is dumped as flat text. No injection fence around user content. No persona consistency rules. No tool usage rules. No honesty/uncertainty handling.

---

## 6. Memory Mechanisms

### Client-side (`lib/memory-engine.ts`)
- **Storage:** localStorage under `lifeos_memory_engine`
- **Categories:** 13 (goal, milestone, decision, project, journal, habit, workout, learning, achievement, failure, lesson, preference, fact)
- **Retrieval:** Keyword search + word-overlap similarity scoring
- **Auto-extraction:** From journal entries, missions, decisions, habits streaks, completed chapters
- **Importance score:** 1-3 scale, set manually per write

### Server-side (`lib/jarvis-db.ts` + `app/api/jarvis/memories/`)
- **Storage:** Supabase `jarvis_memories` table
- **Schema:** `{ id, user_id, text, category, source, session_id, embedding vector(384), is_pinned }`
- **Retrieval:** Basic CRUD by user_id

### Embeddings (`app/api/jarvis/embeddings/route.ts`)
- **Model:** OpenAI text-embedding-ada-002 (128 lines, but unused)
- **Fallback:** Hashed string fallback
- **Vector search:** Exists in the route but NOT integrated into the chat pipeline

**Weakness:** Client-side memory uses keyword matching, not semantic search. The embeddings API exists but is completely disconnected from the chat pipeline. No memory importance scoring formula. No eviction policy. No deduplication. No tiered storage (hot/warm/cold). Memories are never written back after a conversation turn.

---

## 7. Context Window Strategy

**There is no context window strategy.** The current approach:

```
[System Prompt] ~400-600 tokens
[All conversation history] unlimited (raw messages reloaded every turn)
[LifeOS Context dump] ~200-400 tokens
[Current user message] variable
```

**Weaknesses:**
- No token budgeting
- No compression
- No priority ordering
- No session summary
- No memory injection from long-term storage
- No embedding search integration
- Duplicate context building (3 separate places build their own context)

---

## 8. RAG Pipeline

**There is no active RAG pipeline.** The vector infrastructure exists:
- `pgvector` extension enabled in schema
- `embeddings` column on `jarvis_memories` and `jarvis_documents`
- `/api/jarvis/embeddings` route generates embeddings + searches

But none of it is connected to the chat flow. When a user sends a message, no embedding search is performed. `getSimilarMemories()` in `memory-engine.ts` does keyword overlap, not semantic search.

---

## 9. Critical Weaknesses Summary

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | No multi-agent architecture (Planner/Executor/Critic) | High | Single-turn LLM has no reasoning depth |
| 2 | No context window management | High | Will exceed context on long conversations |
| 3 | Client-side tool execution | High | No validation, no audit, no permissions |
| 4 | Embeddings API unused in chat | High | No semantic memory retrieval |
| 5 | No RAG pipeline | High | No context from documents/knowledge base |
| 6 | Duplicate context building (3 sources) | Medium | Inconsistent, wastes tokens |
| 7 | No session compression/summary | Medium | Every message sent every turn |
| 8 | No self-correction loop | Medium | Errors pass through uncaught |
| 9 | No prompt injection protection | Medium | User can override system prompt |
| 10 | No rate limiting on chat route | Medium | No token budget enforcement |
| 11 | No structured logging/observability | Medium | Cannot debug or monitor |
| 12 | Empty catch blocks throughout | Low | Silent failures everywhere |
| 13 | Hardcoded "aki" auth bypass | Medium | Security concern |
| 14 | No tool chaining | Low | Single tool per turn |
| 15 | Single-model, no fallback | Low | Model failure = feature failure |

---

## 10. Features to Preserve

These existing features must NOT be broken during the upgrade:
1. All 8 existing tool functions (must remain working, can be enhanced)
2. Voice command pipeline (STT → intent → execute)
3. Briefing generation (morning/evening/weekly/monthly)
4. Voice journaling with mood extraction
5. LifeOS context gathering (goals, health, gym, sleep, etc.)
6. Multi-provider support (OpenAI, Ollama, Anthropic, Gemini, Groq)
7. Streaming chat UI with markdown rendering
8. Session management (create, list, delete, rename)
9. Memory browser UI (view, search, pin, delete)
10. Existing settings panel for provider configuration
11. Proactive alerts (goals, water, journal reminders)
12. Automation actions (study plan, workout, schedule, review)
