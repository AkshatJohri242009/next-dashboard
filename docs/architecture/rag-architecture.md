# RAG Architecture

## Pipeline Overview

```
Document/Text → Chunker → Embedding Model → Vector Store → Hybrid Retrieval → Context
```

## Chunking Strategy

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Chunk size | 512 tokens | Balances specificity vs. context |
| Overlap | 64 tokens | Preserves boundary context |
| Strategy | Recursive split on `\n\n` > `\n` > `.` > ` ` | Preserves semantic units |
| Metadata tags | `{ source, type, date, category, doc_id }`| Enables filtered retrieval |

## Embedding Model

**Selection: `text-embedding-3-small`** (OpenAI)

| Criterion | Value |
|-----------|-------|
| Dimensions | 384 (matches existing pgvector schema) |
| Cost | $0.02/1M tokens |
| Latency | ~100ms per request |
| Quality | Top-tier for MTEB benchmark |

**Tradeoff:** Uses existing `vector(384)` column. If OpenAI is unavailable, fall back to a hash-based keyword search (not embeddings).

## Vector Store

**Store:** Supabase (existing `pgvector` extension)  
**Table:** `jarvis_memories` and `jarvis_documents` (existing, with `embedding` column)  
**Index:** IVFFlat with 100 lists (for 384d vectors)

## Hybrid Retrieval

```
Final Score = (0.4 × BM25 Score) + (0.4 × Cosine Similarity) + (0.2 × Recency Normalizer)

BM25 Score: keyword overlap with query tokens
Cosine Similarity: embedding distance (1 - cosine)
Recency Normalizer: min(1.0, days_since / 30)
```

**Re-ranking:** Results are re-sorted by final score. Top-5 returned.

## Indexing Pipeline

```
Event (new memory, document, journal entry)
    │
    ▼
Chunk (if >512t)
    │
    ▼
Generate embedding (POST /api/jarvis/embeddings)
    │
    ▼
Store in Supabase (upsert by id)
    │
    ▼
Confirm index updated
```

## Query Expansion

Before retrieval, rewrite the user query to maximize recall:

```
Original: "How was my sleep this week?"
Expanded: "sleep hours rest recovery quality sleep_score last_night sleep_pattern week_analysis"
```

**Technique:** Extract nouns + key phrases, add domain synonyms, concatenate.
