# Session Context — June 4, 2026

## Project
**LifeOS** — AI-powered Personal Operating System (Next.js 14, Supabase, Zustand, Recharts, Framer Motion, 52 static routes) with JARVIS 2.0 intelligence layer: voice system, memory engine, correlation engine, future self engine, annual life report, automation engine, plus full health/fitness/sleep tracking, and premium design system.

## Live URL
`https://next-dashboard-alpha-seven.vercel.app`

## Recent Changes (June 3)

### Type Safety Remediation — COMPLETE
- **149 `any` annotations fixed** across 9 lib files: `voice-intents.ts`, `voice-briefings.ts`, `jarvis-context.ts`, `automation-engine.ts`, `life-engine.ts`, `life-report.ts`, `future-engine.ts`, `forecast-engine.ts`, `correlation-engine.ts`
- **Page file `any` annotations fixed**: `missions`, `reviews`, `habits`, `brain`, `timeline`, `journal` pages
- **Catch clause patterns**: `(err: any)` → `(err)` with `(err as Error).message` everywhere
- **`jarvis-store.ts` sendMessage**: typed all localStorage `JSON.parse` results, typed filter/map lambdas
- **`jarvis-db.ts`**: `Record<string, any>` → explicit typed objects, `as any` → `as unknown as T`
- **Real type bugs uncovered**: `WorkoutLog.at` (number) vs `.date` (string) mismatches in 6 files; nonexistent `question`/`emoji`/`topic`/`date`/`title` fields removed; string-vs-number coercion for LLM params added

### Learning Progress on Dashboard — NEW
- `components/home/LearningProgress.tsx` — per-subject progress (Physics/Chemistry/Math/CS), avg scores, weak topic flags, revision cycle (Rest/Light/Active), streak, avg test score
- Wired into `app/page.tsx` between Action section (TodaysMission + AIRecommendations) and HabitsModule

### Life Score Transparency — FIXED
- **sleepMinutes bug fixed**: reads `last_sleep_hours` from localStorage instead of hardcoded `0`
- **Weight labels**: each dimension bar shows its weight (25%, 20%, 20%, 15%, 10%, 10%)
- **Info toggle**: `Info` icon button toggles a panel showing the full formula + per-dimension descriptions
- **Wealth marked `(placeholder)`**: subtle text next to Wealth bar
- **Momentum descriptions**: daily/weekly/monthly now show "Today's goal completion", "7-day goal completion", "Avg of daily + weekly"

### Task Priority/Timing — NEW
- `Goal` interface extended: `priority?: "low" | "medium" | "high"`, `dueDate?: string`, `estimatedMinutes?: number`
- `store.addGoal()` updated to accept `{ reminderMin, priority, dueDate, estimatedMinutes }` options object
- TodaysMission creation form: priority picker (High/Medium/Low), date input, minutes estimate
- Goal rows show: priority badge (color-coded), due date, estimated time
- Goals auto-sorted high → medium → low after `loadGoals()`
- Voice command `addGoal` forwards priority from LLM

## Architecture
- **52 static routes** — monolithic Next.js App Router, all pages are `"use client"`, no SSR
- **State**: Zustand store hydrates from localStorage, synced to Supabase via `autoSync()` / `pushToSupabase()` / `pullFromSupabase()`
- **Timestamps**: Every localStorage write uses `_ts:key` pattern via `storeSet()` + `markModified()` for sync conflict resolution
- **Theme**: CSS variables on `:root` + `.light` class overrides for ALL Tailwind utility patterns (light mode)
- **Mobile**: All touch targets ≥28px (`h-8`), hover-reveal buttons use `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`, forms stack vertically on mobile, all row layouts have `flex-wrap`

### Key Constraints
- Study mode uses same glass/typography/spacing design system as work mode with its own grouped sidebar sections (Dashboard, Tasks, Resources, Tools)
- Mode toggle in TopNav saves last‑visited path per mode and navigates on switch; mode persists to localStorage
- Focus sounds generated via Web Audio API (white, pink, brown noise, rain) — no external files
- Commute timer computes flight minutes via Haversine + 850 km/h + 30 min buffer
- All data persisted to localStorage + synced to Supabase via `autoSync()` / `syncWithSupabase()` — raw `localStorage.setItem` without `_ts:` prefix or `markModified()` is a sync error
- Mobile: no button under 28 px (minimum `h-8`), `grid-cols-2` on stats for < 640 px, `flex-col sm:flex-row` on forms, `flex-wrap` on all row layouts, card padding `p-4 sm:p-6`; touch‑visible controls via `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`
- Stock tracker uses Yahoo Finance proxy API (quote, history, search) with currency‑aware display (₹ for BSE/INR, $ for USD, € for EUR, etc.)
- Theme system uses CSS variables on `:root`; `.light` class overrides ALL Tailwind white/black/ring‑offset utility patterns for light mode; `ring-offset-[var(--bg)]` instead of hardcoded `ring-offset-[#111]`
- Sleep timer auto-expires after 16 h of inactivity; default awake
- JARVIS uses Supabase `jarvis_users` table with bcrypt + httpOnly cookie (7‑day) with in-memory fallback when Supabase is unavailable; chat streams SSE to Groq/OpenAI-compatible endpoints; Life Engine gathers real-time localStorage data per module and injects it into system prompt for personalized responses
- Voice system uses Web Speech API by default (free, no API key); provider-agnostic with Whisper/Deepgram/ElevenLabs API routes; voice commands use LLM (Groq) for natural language understanding instead of regex intent matching
- Goals persist across days — `loadGoals()` merges pending goals from last 7 days, inline add/delete on TodaysMission
- Automation engine exposed on `/reviews` with 6 one-click automations (study plan, workout routine, daily schedule, weekly review, organize notes, recommend priorities)
- `autoExtractMemories()` runs on every app startup via layout.tsx, continuously scanning Journal/Missions/Decisions/Habits/Learning for new entries

## Routes
### Core
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | HomePage | Command Center: AIBriefing (hero 60%), LifeScore, TodaysMission, AIRecommendations, LearningProgress, HabitsModule, Quick Access grid (14 links), GoalTicker |
| `/odyssey` | JarvisChat | JARVIS AI strategist with auth, sessions, streaming chat |

### Life OS
| Route | Component | Purpose |
|-------|-----------|---------|
| `/habits` | HabitsModule | Dedicated habit tracking with stats |
| `/journal` | JournalModule | Mood-based daily journaling with analytics |
| `/learning` | LearningOSModule | Subject-based chapter tracking with scores, revision cycle, weak topic detection |
| `/missions` | MissionsModule | Long-term missions with milestones & progress |
| `/timeline` | LifeTimeline | Chronological life events with categories |
| `/decisions` | DecisionLog | Major choices with options, outcomes, reflection, outcome analytics |
| `/reviews` | ForecastEngine + AutomationPanel | Weekly/monthly reviews, habit projections, AI recommendations, 6 automation tools |
| `/brain` | KnowledgeGraph | Connected ideas with SVG graph visualization |

### Health
| Route | Component | Purpose |
|-------|-----------|---------|
| `/health` | WaterTracker + SupplementScheduler | Hydration & supplement timing |
| `/gym` | WorkoutLog + GymCalendar + StrengthChart + ProgressPhotos | Full gym tracker |
| `/weight` | WeightTracker | Weight logging with trend chart |
| `/sleep` | SleepTracker + SleepTimer | Sleep logging with 7-day avg chart + start/stop timer |

### Data
| Route | Component | Purpose |
|-------|-----------|---------|
| `/stocks` | StockList + StockDetail | Portfolio with Yahoo Finance quotes & history |
| `/projects` | ProjectTracker | Project management |
| `/opencode` | WebDAV | OpenCode file manager |

### Study Mode
| Route | Component | Purpose |
|-------|-----------|---------|
| `/study` | StudyCalendar + StudyTimer + FocusSounds + StudyStats | Overview dashboard |
| `/study/stats` | StudyStats | Test scores & error log |
| `/study/tasks` | StudyTasks | Task list with streak |
| `/study/exams` | ExamDates | Exam countdowns |
| `/study/files` | StudyFiles | File uploads (base64, 10MB limit) |
| `/study/sounds` | FocusSounds | White/pink/brown/rain noise |
| `/study/commute` | CommuteTimer | Airport flight timer (Haversine) |

### JARVIS 2.0 Intelligence
| Route | Component | Purpose |
|-------|-----------|---------|
| `/voice` | VoiceButton + VoiceBriefingPanel + VoiceJournalModal | Voice commands (LLM-powered), briefings, journaling |
| `/briefings` | VoiceBriefingPanel | Daily, weekly, monthly AI briefings with speak-aloud |
| `/memory` | MemoryAmplifier | Life Memory Engine — search, filter, auto-extract, stats |
| `/correlations` | CorrelationPanel | Sleep→mood, gym→productivity, hydration→mood pattern discovery |
| `/future` | FutureSelfPanel | 3/6/12 month projections with risk/opportunity |
| `/report` | LifeReportCard | Annual "Spotify Wrapped for life" report |

## Key Components — June 3 Additions/Changes

### `components/home/LearningProgress.tsx` — NEW
- Reads `lifeos_chapters`, `study_streak_v1`, `study_scores_v1` from localStorage
- 4-column grid: Physics, Chemistry, Mathematics, Computer Science with chapter completion bars
- Each subject: completed/total count, progress bar, avg score with color threshold
- Weak topic flag (AlertTriangle icon) when avg < 60%
- Footer row: chapters done, revision cycle (color-coded), streak, avg test score, weak subjects list

### `components/home/LifeScore.tsx` — UPDATED
- `sleepMinutes` now reads from `last_sleep_hours` localStorage (multiple by 60), not hardcoded `0`
- Dimension weight labels next to each bar name (e.g. "Health 25%")
- `(placeholder)` label on Wealth dimension
- `Info` icon button toggles a `motion.div` with full formula breakdown
- Formula panel: `Life Score = Health×25% + Fitness×20% + Learning×20% + Projects×15% + Wealth×10% + Habits×10%`
- Per-dimension descriptions (e.g. "Water ×40pts + Sleep ×40pts + Supplements ×20pts")
- Momentum labels: "Today's goal completion", "7-day goal completion", "Avg of daily + weekly"

### `components/home/TodaysMission.tsx` — UPDATED
- Creation form now has: priority picker (High/Medium/Low colored buttons), date input (Calendar icon), minutes estimate (Clock icon)
- Goal rows show: priority badge (color-coded text on tinted background), due date (`Calendar + "Jun 3"`), estimated time (`Clock + "30m"`)
- Priority sorting: high → medium → low via `loadGoals()`

### `lib/types.ts` — UPDATED
- `Goal.priority?: "low" | "medium" | "high"`
- `Goal.dueDate?: string`
- `Goal.estimatedMinutes?: number`

### `lib/store.ts` — UPDATED
- `addGoal(text, options?)` — second param is now `{ reminderMin?, priority?, dueDate?, estimatedMinutes? }`
- `loadGoals()` sorts by priority after merging carry-over goals

### `lib/voice-intents.ts` — UPDATED
- `addGoal` intent forwards `action.params?.priority` as `"low" | "medium" | "high"` to store

### `app/ClientLayout.tsx` — FIXED (June 4)
- **Removed `AnimatePresence mode="wait"`** wrapper around page content
- Sub-pages (`/journal`, `/focus`, `/habits`, etc.) were showing black screen because `AnimatePresence mode="wait"` would start the exit animation and then never properly enter the new page, leaving the motion.div stuck at `opacity: 0`
- Simplified to bare `<motion.div>` with `initial` / `animate` — still fades in on navigation, no exit animation

### `lib/store.ts` — PERSISTENCE FIX (June 5)
- **Added `lifeos_pending_goals`** — a persistent non-date-based list of all incomplete goals, so they never disappear after 7 days
- **`addGoal()`** now writes to both today's key AND the pending list
- **`toggleGoal()`** syncs completion status to pending list
- **`deleteGoal()`** removes from both today and pending list
- **`loadGoals()`** replaced the 7-day scan with reading from `lifeos_pending_goals` — all pending goals always appear
- **`pushToTomorrow()`** no longer removes incomplete goals from today — keeps the original day intact

### `app/missions/page.tsx` — UNIFIED VIEW (June 5)
- Added `<TodaysMission />` component at the top of the Missions page
- Same goals widget from the home page now appears on `/missions` too — add, toggle, delete from either page
- Uses the same Zustand store, so both pages always show identical data

### JARVIS Improvements — June 5

#### Tool Calling (Function Calling)
- **`lib/jarvis-tool-defs.ts`** — 8 tool definitions (addGoal, toggleGoal, deleteGoal, logWater, logHabit, journalEntry, getGoals, getContext) with typed JSON schemas for Groq function calling
- **`lib/jarvis-tools.ts`** — `executeToolCall()` runs each tool client-side, reading/writing localStorage (goals, health, habits, journal)
- **`app/api/jarvis/chat/route.ts`** — Detects `finish_reason: "tool_calls"` in the Groq stream, accumulates tool call chunks, sends `type: "tool_call"` SSE events to the client. On follow-up requests with `toolResult`, sends tool response back to the model
- **`lib/jarvis-store.ts`** — `sendMessage()` now handles `tool_call` events: executes the tool, adds a system message showing the result, then sends a follow-up request with the tool result and streams the final response
- JARVIS can now create/update/delete goals, log water, log habits, write journal entries, and query context — all by just asking in chat

#### Proactive JARVIS Alerts
- **`lib/store.ts`** — Added `jarvisAlerts: JarvisAlert[]` to the Zustand store with `setJarvisAlerts()` action
- **`app/ClientLayout.tsx`** — Runs proactive checks every 60s: goals not started after 2pm, low water after 12pm, no journal entry after 8pm — pushes alerts to the bell notification panel
- **`components/layout/NotificationPanel.tsx`** — Shows JARVIS alerts alongside water/sleep notifications, dismisses all on panel close

#### Goal Persistence (also June 5)
- `lifeos_pending_goals` key stores all incomplete goals permanently
- `loadGoals()` scans 365 days back for existing goals + migrates them into pending list
- Goals never disappear unless explicitly deleted or marked done

## Next Steps
- **RLS policies** for JARVIS Supabase tables (~30 min)
- **SSR/ISR** for static pages (~3-5h)
- **AIRecommendations dynamic** — replace hardcoded study recommendation with real data from `gatherContext()` (weak topics, upcoming exams, revision cycle)
