# Agent Architecture

## Subsystem Overview

### 1. Planner
**When it activates:** User request requires multiple steps or tool calls.

**Activation logic:**
```
If message contains: "analyze", "compare", "research", "plan", "investigate"
  OR requires >1 tool call
  OR references multiple data sources → ACTIVATE Planner
Else → skip to Executor
```

**Behavior:**
- Takes the user's goal and decomposes into a numbered step plan
- Returns plan to Context Manager which passes it to Executor
- Example: "How am I doing this week?" → [1] Load goals, [2] Load health data, [3] Load gym data, [4] Synthesize summary

### 2. Executor
**Activates:** Always (after optional Planner)

**Behavior:**
- Receives system prompt + context + current message (or plan step)
- Streams LLM response to user
- Detects tool calls → routes to Tool Router → injects result → continues streaming
- If tool call fails, sends error message and continues (no crash)

### 3. Critic
**Activates:** After Executor finishes streaming a response (before delivery)

**Scoring:**
- Relevance (0-1): Is the response on-topic?
- Completeness (0-1): Does it address all parts of the query?
- Accuracy (0-1): Does it cite facts from provided context?
- Instruction adherence (0-1): Does it follow system instructions?

**Composite score:** `(relevance × 0.3) + (completeness × 0.3) + (accuracy × 0.25) + (adherence × 0.15)`

**Action:** If score < 0.6, Executor retries with Critic's feedback injected. Max 2 retry cycles.

### 4. Reflection Engine
**Activates:** Asynchronously after response delivery (never blocks main flow)

**Behavior:**
- Summarizes the exchange in 2-3 sentences
- Extracts user preferences, facts, decisions → long-term memory
- Identifies action items
- Logs to audit trail

### 5. Self-Correction Loop
```
Executor → Critic → [score < 0.6 → Executor with feedback → Critic → ... max 2x]
                → [score ≥ 0.6 → Deliver]
```

### 6. Context Manager
**Activates:** Before every turn

**Behavior:**
- Assembles context window from all memory tiers (see context-strategy.md)
- Applies priority ordering when budget exceeded
- Compresses session history via summarization if > budget

### 7. Tool Router
**Activates:** When Executor triggers a tool call

**Behavior:**
- Validates tool name against whitelist
- Checks rate limits per tool
- Routes to the correct handler
- Returns result or error

---

## Subsystem Activation Matrix

| User Message Pattern | Planner | Executor | Critic | Reflection | Tool Router |
|---------------------|---------|----------|--------|------------|-------------|
| Simple query ("What time is it?") | ✗ | ✓ | ✓ | ✓ | ✗ |
| Data request ("Show my goals") | ✗ | ✓ | ✓ | ✓ | ✓ (getContext) |
| Action ("Add a goal to exercise") | ✗ | ✓ | ✓ | ✓ | ✓ (addGoal) |
| Complex analysis ("How is my health trending?") | ✓ | ✓ | ✓ | ✓ | ✓ (multiple) |
| Ambiguous ("Help me plan my week") | ✓ | ✓ | ✓ | ✓ | ✓ (multiple) |
| System command ("Change my model") | ✗ | ✓ | ✗ | ✗ | ✓ (settings) |
