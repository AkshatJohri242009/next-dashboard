# Session Context — June 2, 2026

## Project
**LifeOS** — AI-powered Personal Operating System (Next.js 14, Supabase, Zustand, Recharts, Framer Motion, 52 static routes) with JARVIS 2.0 intelligence layer: voice system, memory engine, correlation engine, future self engine, annual life report, automation engine, plus full health/fitness/sleep tracking, and premium design system.

## Live URL
`https://next-dashboard-alpha-seven.vercel.app`

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
| `/` | HomePage | Command Center: AIBriefing (hero 60%), LifeScore, TodaysMission, AIRecommendations, HabitsModule, Quick Access grid (14 links), GoalTicker |
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

## Key Components

### Layout
- **Sidebar**: 6 grouped sections with section labels when expanded (Core, Life OS, Health, Intelligence, Life Data, Dev) + study mode groups; collapse toggle
- **TopNav**: LifeOS logo, date, mode toggle, Focus Mode, search/command palette, AI panel, theme panel, notifications
- **CommandPalette**: 27 commands covering all pages + actions (add goal, focus, journal, log workout, add habit, generate study plan, create daily schedule, run weekly review, recommend priorities)
- **ScrollToTop**: Floating button after 300px scroll
- **FocusMode**: Full-screen Pomodoro overlay (25/5/15 presets)
- **JarvisPresence**: Bottom-left status ticker with cycling insights

### Life OS Modules (all localStorage-only)
- **HabitsModule**: 4 categories (health/learning/productivity/mindfulness), 6 auto-seeded defaults, streak calculation from consecutive daily logs, toggle/add/delete
- **JournalModule**: 5 moods (great→awful) with emoji + color, tags, pattern insights (majority positive/negative detection), today entry indicator
- **LearningOSModule**: 4 subjects (Physics/Chemistry/Math/CS), completion toggles, % score entry, per-subject avg, revision cycle indicator (Rest/Light/Active/Intensive), weak topics detection
- **MissionsModule**: Milestones with toggle, 3 statuses (active/paused/completed), expandable view, progress bar
- **DecisionLog**: Options list with chosen indicator, 3 outcomes (positive/neutral/negative), tags, reflection, outcome analytics bar with positive rate
- **LifeTimeline**: 6 categories (career/education/relationship/move/achievement/other), year separators, color-coded dot timeline
- **KnowledgeGraph**: SVG connection lines between linked ideas, click-to-select panel, connection search/toggle, incoming/outgoing count

### Home Page Components
- **AIBriefing**: Hero-section layout (60% visual weight), 48px gradient greeting, ambient radial glow, data-driven insights from real localStorage, auto-run Top Priority recommendation, Full Briefing + Voice Command action links
- **LifeScore**: Animated SVG ring with counter (0–100), 6-dimension breakdown bars with colored progress, momentum delta (daily/weekly/monthly)
- **TodaysMission**: Inline goal toggling with completion badge counter, empty state
- **AIRecommendations**: Categorized insight cards (positive/negative/action/neutral) with type-based coloring
- **Quick Access**: 14-link card grid to all Life OS + JARVIS 2.0 pages
- **GoalTicker**: Animated goal completion bar

### JARVIS 2.0 Voice System
- **LLM-powered voice commands**: Speech → transcript → JARVIS (Groq) with full LifeOS context → action execution or conversational answer
- **12 executable actions**: addGoal, completeGoal, logHabit, addHabit, logWater, logWorkout, startSleepTimer, stopSleepTimer, logJournal, logStudy, navigate, addReminder, setSleep, toggleSupp
- **Web Speech API STT/TTS** by default (free, no API key); premium providers via Whisper/Deepgram/ElevenLabs API routes
- **VoiceButton**: Floating mic bottom-right, listen→process→speak→navigate
- **VoiceBriefingPanel**: Tabbed morning/evening/weekly/monthly briefings with speak-aloud
- **VoiceJournalModal**: Mic→transcribe→parse→mood picker→save with auto memory

### JARVIS 2.0 Life Memory Engine
- 12 memory categories (goal, milestone, decision, project, journal, habit, workout, learning, achievement, failure, lesson, preference, fact)
- CRUD operations, search, similarity search (pgvector on Supabase, hash-fallback locally)
- `autoExtractMemories()` scans Journal/Missions/Decisions/Habits/Learning for new entries on app startup
- Memory stats: total count, category distribution

### JARVIS 2.0 Correlation Engine
- 30-day snapshot analysis across sleep, gym, mood, productivity, hydration, habits
- `discoverCorrelations()` with strength/confidence scoring
- `generateCorrelationInsight()` with context-aware summary

### JARVIS 2.0 Future Self Engine
- `generateProjections()`: gym sessions, sleep avg, habit consistency, mood positivity rate, goal completion, water intake
- 3/6/12 month projections with trend, risk/opportunity assessment
- Bar chart visualization of current vs projected

### JARVIS 2.0 Annual Life Report
- `generateLifeReport()`: total goals, gym sessions, journal entries, habit streaks, decisions, missions, chapters, avg sleep, best month, top achievements, growth areas, random quote

### Automation Engine (`lib/automation-engine.ts`)
- 6 automations exposed via AutomationPanel on `/reviews`:
  - **Generate Study Plan**: Creates revision schedule from incomplete chapters
  - **Generate Workout Routine**: Analyzes gym history, recommends focus
  - **Create Daily Schedule**: Organizes today's pending goals and habits
  - **Generate Weekly Review**: Auto-summarizes the week
  - **Organize Notes**: Reviews knowledge graph ideas
  - **Recommend Priorities**: AI-suggested top priorities for today

### Life Engine (`lib/life-engine.ts`)
- `calculateLifeScore()`: 6-dimension breakdown (health, fitness, learning, projects, wealth, habits)
- `generateBriefing()`: Data-driven daily briefing from real localStorage (goals, water, gym, sleep, study, habits)
- `generateWeeklyReview()`: Wins, losses, progress, risks, recommendations
- `computeMomentum()`: Daily/weekly/monthly goal completion rate

### JARVIS AI
- **Auth**: Signup/login/logout with bcrypt + httpOnly cookie (7-day), auto-creates default "General" session. In-memory fallback when Supabase unavailable.
- **Chat**: SSE streaming to any OpenAI-compatible endpoint (Groq default: `llama-3.3-70b-versatile`)
- **Context injection**: Real-time LifeOS data (goals, water, gym, sleep, habits, memories, decisions, missions, journal, learning, tomorrow tasks) gathered before each message via `gatherContext()`
- **Per-page insights**: `JarvisInsightBar` on all 20+ key pages with type-based icons/colors, dismiss support
- **Database**: 7 Supabase tables — users, sessions, messages, memories (pgvector), documents, endpoints, auth_sessions
- **API routes**: `/api/jarvis/auth/*`, `/api/jarvis/chat`, `/api/jarvis/sessions`, `/api/jarvis/messages`, `/api/jarvis/memories`, `/api/jarvis/documents`, `/api/jarvis/setup`, `/api/jarvis/embeddings`, `/api/jarvis/voice/command`, `/api/jarvis/voice/whisper`, `/api/jarvis/voice/deepgram`, `/api/jarvis/voice/tts`

### Stocks
- Yahoo Finance API proxy (quote, history, search)
- Portfolio cards with currency-aware display (25+ currency symbols)
- Recharts AreaChart with gradient per symbol (1D–5Y range)
- 30s auto-sync cycle

## Light Mode
- `.light` class on `<html>` toggles all CSS variable overrides
- ALL common Tailwind utility patterns overridden in `globals.css`:
  - `text-white/{5-95}` — maps to dark text
  - `bg-white/{5-30}` and `bg-white/[0.01-0.12]` — dark backgrounds
  - `border-white/{5-30}` and `border-white/[0.02-0.14]` — dark borders
  - `hover:text-white/{40-90}` and `hover:bg-white/{5-10}` — hover states
  - `placeholder:text-white/{10-50}` — input placeholders
  - `bg-[#050506]`, `bg-[#0a0a0d]`, `bg-[#111]` — specific dark backgrounds
  - `bg-black/{20-60}` — modals/overlays
  - `ring-offset-[var(--bg)]` — ring offsets
  - `color-scheme: light` on inputs
- ThemePanel: Dark/Light toggle, 8 presets, RGB sliders, native `<input type="color">`

## Environment Variables (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` / `GEMINI_API_KEY`
- `JARVIS_GROQ_KEY` / `JARVIS_DEFAULT_ENDPOINT` / `JARVIS_DEFAULT_MODEL`

## Key Architecture Decisions
- **LLM-powered voice commands**: Voice system sends transcript + full LifeOS context to Groq. JARVIS decides whether to answer questions or execute actions. Returns structured `⟪action:{type,params}⟫` tags for frontend execution. No regex intent matching.
- **No JARVIS auth on voice routes**: `/api/jarvis/voice/*` routes use env var API keys directly, no `requireJarvisUser()` check.
- **Local fallback for JARVIS auth**: When Supabase unavailable, `jarvis-db.ts` falls back to in-memory Maps for users/sessions/messages. Auth works immediately.
- **Web Speech API as default voice provider**: Free, no API key, works in Chrome/Edge/Safari. Whisper/Deepgram/ElevenLabs as premium providers.
- **Goal persistence via date-key merging**: `loadGoals()` scans last 7 days of `goals:YYYY-MM-DD` keys, merges incomplete items.
- **Hash-based embedding fallback**: When OpenAI unavailable, `/api/jarvis/embeddings` generates 384-dim embeddings from word-frequency hashing with L2 normalization.
- **Component-scoped timers**: Pomodoro and commute timers in `useState` + `useRef` interval, not Zustand.
- **CSS variable theme system**: `.light` class on `<html>` overrides ALL Tailwind utility patterns for light mode.
- **Home page 60/25/15 hierarchy**: 60% hero (AIBriefing), 25% insights (LifeScore), 15% action (TodaysMission + AIRecommendations), secondary below.
- **Sleep timer buttons on /sleep page**: Start/Stop timer with live elapsed display, Wake Up button.
