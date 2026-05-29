# Session Context — May 29, 2026

## Project
Single personal dashboard PWA (Next.js 14, Supabase, Zustand, Recharts). Deployed to Vercel.

## Live URL
`https://next-dashboard-alpha-seven.vercel.app`

## Completed Work

### Mode Persistence
- `mode` initializes from `localStorage.getItem("dashboard_mode")` — survives close/reopen
- `setMode` writes `storeSet("dashboard_mode", m)` + calls `autoSync()`
- `lastWorkPath` (default `"/"`) and `lastStudyPath` (default `"/study"`) stored in Zustand, tracked via `usePathname`
- `ModeToggle.tsx` uses a `switching` ref guard to prevent path-conflict loops on switch

### Theme System
- **CSS variables** in `:root`: `--brand`, `--brand-500`, `--accent`, `--accent-500`, `--bg`, `--bg-secondary`, `--text`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--border`, `--border-strong`, `--glass-bg`
- **Tailwind**: `brand-400`, `brand-500`, `accent-400`, `accent-500` reference CSS variables; `theme-*` color namespace available
- **`.light` class** overrides all CSS variables AND overrides every common Tailwind utility pattern (`text-white/*`, `bg-white/[x]`, `border-white/[x]`, hover states, placeholder colors, `bg-[#050506]`, `bg-[#0a0a0d]`, `bg-surface-800`, `color-scheme`, etc.)
- **Glass classes** (`.glass`, `.glass-strong`) use CSS variables; `text-gradient` uses `var(--text)`
- **ThemePanel** component: Dark/Light toggle, 8 preset color pairs, RGB sliders for brand + accent, native `<input type="color">`
- Theme button (`Palette` icon) in TopNav, opens dropdown via `AnimatePresence`, closes on outside click
- `applyTheme` in store.ts sets 4 CSS variables + toggles `.light` class
- Persisted to `theme_v1` key in `allLocalState()` for Supabase sync

### Stocks Tab
- **API routes**: `/api/stock/quote` (current prices), `/api/stock/history` (1D–5Y data), `/api/stock/search` (search by company name via Yahoo Finance)
- **Zustand store**: `stockHoldings`, `stockQuotes`, `stockExpandedSymbol`, `loadStocks`, `addStock`, `removeStock`, `setStockExpanded`, `fetchStockQuotes`
- **Components**: `StockList` (search-by-name input with debounced dropdown, holdings cards, value/return stats, portfolio summary with Holdings/Value/Return cards), `StockDetail` (range selector 1D/5D/1M/3M/1Y/5Y, Recharts AreaChart with gradient)
- **Sidebar**: position #2 in workNav (after Dashboard), `TrendingUp` icon
- **Layout sync**: `loadStocks()` + `fetchStockQuotes()` called on mount and every 30s interval
- **Gradient fix**: `stockGrad_${symbol}` unique ID per symbol to avoid SVG conflicts
- Persisted to `stocks_holdings_v1`, `stocks_quotes_v1` in `allLocalState()`

### Sound System (Web Audio API)
- Four noise types: white, pink, brown, rain — generated from noise algorithms in 3s `AudioBuffer`, looped
- Brown noise has fade at loop boundary to avoid clicks
- `try`/`catch` around `AudioContext`, `window.AudioContext || window.webkitAudioContext` fallback
- `play*()` return `null` on failure
- `FocusSounds.tsx`: `setStopFn(s)` not `() => s`, null guard, `stopAllSounds` only on unmount

### Study Mode
- **Pomodoro timer**: `StudyTimer` component with 25/5/15 min presets, play/pause/reset
- **Focus sounds**: `FocusSounds` with white/pink/brown/rain, volume slider
- **Study tasks**: `StudyTasks` with add/toggle/delete, streak counter (consecutive days with completed tasks)
- **Exam dates**: `ExamDates` with add/delete, days-until calculation, upcoming/past split
- **Study files**: `StudyFiles` with upload (base64, 10MB limit), download, delete, storage usage
- **Commute timer**: `CommuteTimer` with airport typeahead via JSON dataset, Haversine distance, 850 km/h + 30min buffer
- **Study calendar**: `StudyCalendar` — month grid at top of study dashboard, prev/next navigation, today highlight, red dot for exams, green dot for tasks, legend
- **Study stats**: `StudyStats` — test/mock score logging (subject, score/total, color-coded performance %), error log (subject, topic, notes), avg %, persisted to `study_scores_v1` / `study_errors_v1` with `_ts:` + `markModified`, in `allLocalState()`
- All study localStorage keys use `storeSet` with `_ts:` timestamp + `markModified`
- `study_tasks_v1`, `exam_dates_v1`, `study_files_v1`, `study_streak_v1`, `study_scores_v1`, `study_errors_v1` in `allLocalState()` for Supabase push

### UI & Mobile Fixes
- Layout padding: `p-3` → `p-4`
- Stats grids: `grid-cols-3` → `grid-cols-2 sm:grid-cols-3` (StudyTasks, ExamDates, StudyStats, StockList)
- Touch targets: all hover-reveal delete/download buttons given `h-8 w-8` (≥28px), slider thumbs `w-9 h-9`, close buttons in AIPanel/Sidebar
- PeakRing: phase `text-[10px] sm:text-[9.5px]`, time `text-[11px] sm:text-[10.5px]`
- TodoList icon buttons `h-7` → `h-8 w-8 sm:h-7 sm:w-7`
- WaterTracker: `grid-cols-1 sm:grid-cols-2 md:grid-cols-5`
- SleepTracker AI button: added `py-2`
- Sidebar nav: removed `scrollbar-hide` so scrollbar is visible
- Date inputs: `color-scheme` handled by `.light` CSS override
- StockList: responsive card layout — `px-3 sm:px-4`, `py-2.5 sm:py-3`, company name + buy gain% hidden on mobile (`hidden sm:*`), change $ hidden on mobile, smaller text `text-[10px] sm:text-[11px]`; search input `w-full sm:flex-1`; shares/buy-price inputs `flex-1 min-w-[80px]` instead of fixed widths
- StockDetail: range buttons `h-8 sm:h-7` for mobile touch targets
- StudyStats: stacked input forms on mobile (`w-full sm:flex-1`), description hidden on mobile (`hidden sm:block`); score/total + Add wrapped in `flex` row, delete buttons `h-8 w-8 sm:h-7 sm:w-7`
- StudyCalendar: nav buttons `h-8 w-8 sm:h-7 sm:w-7`, month label `min-w-[100px] sm:min-w-[140px]`
- ThemePanel: opaque `bg-[#050506]` instead of `glass-strong` for RGB slider readability

### Sync Architecture
- `autoSync()` — fire-and-forget push after mutations (non-critical paths)
- `waitSync()` — awaited push (sleep timer start/stop)
- `syncWithSupabase()` — pull-only, compares remote `updated_at` vs local `_ts:key` timestamp, never overwrites newer local data
- `recentlyModified` Set provides 5s fast-path guard
- `storeSet()` writes `_ts:key` for every localStorage write + calls `markModified`
- `_ts:` keys are excluded from push (only used for timestamp comparison)
- `allLocalState()` collects all state keys for push

### Graph Components
- **Sleep**: Recharts ComposedChart (bars + 7-day moving average dashed line). Consistency stat (good days %)
- **Weight**: Recharts ComposedChart (area + 7-day moving average amber dashed line). Streak counter for consecutive days logged
- **Gym**: `GymCalendar` — GitHub-style heatmap (12w × 7d), streak counter, 30-day workout count, color legend by volume

## Key Files
| File | Purpose |
|------|---------|
| `lib/store.ts` | Zustand store, all mutations, sync logic, allLocalState |
| `lib/supabase.ts` | `pullFromSupabase` / `pushToSupabase` |
| `lib/types.ts` | All TypeScript interfaces (Goal, Health, Gym, Stock, Theme, etc.) |
| `lib/study-types.ts` | Study-specific types (StudyTask, ExamDate, StudyFile, StudyScore, StudyError) |
| `lib/utils.ts` | cn(), date helpers, interpolateColor, waterGoalMl, computePeakWindow |
| `lib/sounds.ts` | Web Audio API noise generators (white, pink, brown, rain) — 3s buffers |
| `app/globals.css` | CSS variables, glass classes, .light theme overrides, utilities |
| `tailwind.config.ts` | Brand/accent/amber colors (400/500 use CSS vars), theme color namespace, animations |
| `app/layout.tsx` | Root layout — sidebar, topnav, command palette, AI panel, swipe handler, theme application, sync cycle |
| `components/layout/Sidebar.tsx` | Work/study nav, mobile menu, AI button, collapse toggle |
| `components/layout/TopNav.tsx` | Mode toggle, search, AI button, theme button, notifications, GitHub link |
| `components/layout/ModeToggle.tsx` | Work/study switch with path persistence |
| `components/layout/ThemePanel.tsx` | Dark/light toggle, color presets, RGB sliders |
| `components/layout/NotificationPanel.tsx` | Water + sleep timer notifications |
| `components/layout/CommandPalette.tsx` | ⌘K search palette |
| `components/layout/AIPanel.tsx` | AI chat panel (Gemini API) |
| `components/dashboard/PeakRing.tsx` | Peak performance ring, sleep timer Start/Stop |
| `components/dashboard/TodoList.tsx` | Daily goals with drag-reorder, reminders |
| `components/dashboard/GoalTicker.tsx` | Scrolling goal ticker |
| `components/stocks/StockList.tsx` | Stock search, portfolio cards, add/remove |
| `components/stocks/StockDetail.tsx` | Stock history chart with range selector |
| `components/study/StudyTimer.tsx` | Pomodoro timer (25/5/15) |
| `components/study/FocusSounds.tsx` | Sound player controls |
| `components/study/StudyTasks.tsx` | Task list with streak |
| `components/study/ExamDates.tsx` | Exam date manager |
| `components/study/StudyFiles.tsx` | File upload/download |
| `components/study/CommuteTimer.tsx` | Airport commute flight timer |
| `components/study/StudyCalendar.tsx` | Month calendar showing exams + tasks |
| `components/study/StudyStats.tsx` | Test/mock scores + error log |
| `components/sleep/SleepTracker.tsx` | Sleep chart + stats |
| `components/weight/WeightTracker.tsx` | Weight chart + form |
| `components/gym/GymCalendar.tsx` | Consistency calendar heatmap |
| `components/gym/WorkoutLog.tsx` | Workout logging form |
| `components/gym/StrengthChart.tsx` | Per-exercise strength trend charts |
| `components/gym/ProgressPhotos.tsx` | Progress photo upload/view |
| `components/health/WaterTracker.tsx` | Water intake tracker |
| `components/health/SupplementScheduler.tsx` | Supplement checklist |
| `components/ui/GlassPanel.tsx` | Glass panel wrapper with glow variants |
| `components/ui/Button.tsx` | Reusable button component |
| `app/api/chat/route.ts` | Gemini AI chat proxy |
| `app/api/stock/quote/route.ts` | Yahoo Finance quote proxy |
| `app/api/stock/history/route.ts` | Yahoo Finance history proxy |
| `app/api/stock/search/route.ts` | Yahoo Finance search proxy |

## Environment Variables (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Data Sources
- LocalStorage with Supabase sync via `dashboard_state` table
- Zustand store hydrated from localStorage
- Weight: `weight_entries_v1` in localStorage
- Gym logs: `gym_dashboard_v1` via Zustand `gym.logs`
- Sleep log: `sleep_log` key in localStorage
- Study data: `study_tasks_v1`, `exam_dates_v1`, `study_files_v1`, `study_streak_v1`, `study_scores_v1`, `study_errors_v1`
- Stocks: `stocks_holdings_v1`, `stocks_quotes_v1`
- Theme: `theme_v1`

## Routes (21 pages)
| Route | Component |
|-------|-----------|
| `/` | Dashboard (PeakRing, TodoList, GoalTicker) |
| `/stocks` | StockList + StockDetail |
| `/health` | WaterTracker, SupplementScheduler |
| `/gym` | WorkoutLog, GymCalendar, StrengthChart, ProgressPhotos |
| `/weight` | WeightTracker |
| `/sleep` | SleepTracker |
| `/projects` | ProjectTracker |
| `/study` | StudyCalendar, StudyTimer, FocusSounds, StudyStats |
| `/study/stats` | StudyStats |
| `/study/tasks` | StudyTasks |
| `/study/exams` | ExamDates |
| `/study/files` | StudyFiles |
| `/study/sounds` | FocusSounds |
| `/study/commute` | CommuteTimer |

## User Preferences
- Default sleep hours: 8
- Sleep timer notification interval: 45 min
- Water timer default: 45 min
- Default awake, not sleeping
- Theme defaults: dark mode, brand #3bcb85, accent #748ffc
- Mode persists across sessions via localStorage
