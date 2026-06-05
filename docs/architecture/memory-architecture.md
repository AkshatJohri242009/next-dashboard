# Memory Architecture — Five-Tier System

## Tier Overview

| Tier | Name | Storage | TTL | Max Size | Retrieval |
|------|------|---------|-----|----------|-----------|
| 1 | Turn Buffer | In-memory | Current turn only | Raw messages | Direct |
| 2 | Session Memory | Redis | Session lifetime | 800 tokens (compressed) | Key lookup |
| 3 | Long-Term Memory | Supabase | Persistent | Unlimited | Semantic similarity |
| 4 | Project Memory | Supabase | Persistent | Per-workspace | Hybrid search |
| 5 | Global Knowledge | Static file | Read-only | Fixed at startup | Keyword index |

---

## Tier 1 — Turn Buffer

```
Location: In-memory Map (server-side request context)
Schema: Map<sessionId, { role, content, tool_calls?, timestamp }[]>
Cleared: After each turn completes
Max turns: 1 (only current turn)
```

**Purpose:** Hold raw messages from the ongoing exchange. Cleared immediately after the response is delivered.

---

## Tier 2 — Session Memory

```
Location: Redis (or in-memory Map fallback)
Key: session:{sessionId}:summary
Schema:
{
  id: string
  summary: string (compressed, max 800t)
  key_facts: { fact: string, confidence: number }[]
  decisions: string[]
  open_tasks: string[]
  user_preferences: { key: string, value: string }[]
  updated_at: timestamp
}
TTL: Session lifetime + 1h grace
Compression: Every 5 turns, summarize conversation → overwrite summary
```

**Updates:**
- After each turn, Reflection Engine updates the summary
- If summary exceeds 800 tokens, compress oldest facts first

---

## Tier 3 — Long-Term User Memory

```
Storage: Supabase table `jarvis_memories` (existing, enhanced)
Schema:
  id          uuid PK
  user_id     uuid FK → jarvis_users
  key         text (canonical key for dedup)
  value       text (the memory content)
  category    text (fact, preference, goal, decision, lesson, etc.)
  importance  float (0.0-1.0, computed)
  embedding   vector(384)
  source      text (chat, voice, journal, system)
  session_id  text
  last_accessed timestamptz
  access_count  int default 0
  created_at    timestamptz
  updated_at    timestamptz
```

**Importance Scoring Formula:**
```
importance = (recency_score × 0.3) + (access_frequency × 0.2) + 
             (source_authority × 0.2) + (explicit_user_rating × 0.3)

recency_score = min(1.0, days_since_created / 30)     // higher = newer
access_frequency = min(1.0, access_count / 10)         // higher = more accessed
source_authority = { system: 1.0, chat: 0.7, voice: 0.5, user: 0.8 }
explicit_user_rating = user-provided (default 0.5)
```

**Eviction Policy (for retrieval, not deletion):**
- Sort candidates by `(importance × 0.6) + (recency × 0.4)`
- Return top-k within token budget
- Memories with importance < 0.2 are archived (not deleted, just not retrieved)

**Deduplication:**
- Before write, check if `key` already exists for this user_id
- If yes, update `value`, increment `access_count`, recalculate `importance`
- If no, insert new row
- `key` is generated as: `snake_case(category):short_hash(text)`

**User-Facing Management:**
- View all memories with importance scores
- Edit value
- Delete
- Mark as favorite (pinned)
- Search by text, category, date range

**Poisoning Prevention:**
- Validate text length (max 2000 chars)
- Block known injection patterns ("ignore previous instructions", "you are now", etc.)
- Sandbox: if text matches `/(override|ignore|forget|system.*prompt)/i` with high confidence → flag for review, don't write

---

## Tier 4 — Project Memory

```
Storage: Supabase table `jarvis_project_memory`
Schema:
  id           uuid PK
  workspace_id uuid
  type         text (architecture, convention, decision, issue, note)
  content      text
  embedding    vector(384)
  source_file  text (optional, file path)
  created_at   timestamptz
  updated_at   timestamptz
Retrieval: Hybrid BM25 + semantic, re-ranked by recency and type priority
```

---

## Tier 5 — Global Knowledge Base

```
Storage: Static JSON/YAML files loaded at startup
Contents:
  - Framework documentation
  - API reference summaries
  - Common domain knowledge (nutrition, fitness, studying tips)
  - Assistant capability declarations
Format: Pre-chunked + embedded for fast retrieval
```

---

## Retrieval Flow

```
User Message
    │
    ▼
Query Expansion (rewrite for recall)
    │
    ▼
Parallel Fetch:
├── Tier 2: session:{id}:summary (single key lookup) ─ immediate
├── Tier 3: top-5 memories by semantic similarity ─ 50ms
├── Tier 4: top-3 project memories by hybrid search ─ 80ms
└── Tier 5: keyword match against KB index ─ 10ms
    │
    ▼
Merge & Rank:
├─ Sort by (importance × 0.5 + recency × 0.3 + relevance_score × 0.2)
├─ Prune to fit budget
└─ Inject into context window
```
