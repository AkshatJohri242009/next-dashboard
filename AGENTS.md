# Session Context — May 28, 2026

## Project
Single personal dashboard PWA (Next.js 14, Supabase, Zustand, Recharts). Deployed to Vercel.

## Live URL
`https://next-dashboard-alpha-seven.vercel.app`

## Completed Work

### Sleep Timer
- `stopSleepTimer` / `startSleepTimer` use `await waitSync()` so remote is updated before function returns
- `syncWithSupabase` compares remote `updated_at` vs local `_ts:key` timestamp — never overwrites newer local data
- `recentlyModified` Set provides a 5s fast-path guard
- Phase/status in PeakRing defaults to "Awake"; "Sleep timer running" only shows when timer is active
- Percentage shows `--` only while timer is on, not just because it's before 8 AM

### UI Fixes
- Checkbox: replaced invalid Tailwind classes (`w-4.5 h-4.5 border-1.5`) with valid `w-5 h-5 border-2`
- Weight entries reload on sync tick via `syncCount` counter
- Touch targets all ≥28px (buttons, slider thumb 36px)

### Graphs
- **Sleep**: ComposedChart with bars + 7-day moving average dashed line. Consistency stat (good days %)
- **Weight**: ComposedChart with area + 7-day moving average amber dashed line. Streak counter for consecutive days logged
- **Gym**: New `GymCalendar` component — GitHub-style heatmap (12w × 7d), streak counter, 30-day workout count, color legend by volume

### Sync Architecture
- `autoSync()` — fire-and-forget push after mutations (non-critical paths)
- `waitSync()` — awaited push (sleep timer start/stop)
- `syncWithSupabase()` — pull-only, timestamp comparison guard
- `storeSet()` writes `_ts:key` for every localStorage write
- `_ts:` keys are local-only (not pushed to Supabase)

## Key Files
| File | Purpose |
|------|---------|
| `lib/store.ts` | Zustand store, mutations, sync logic |
| `lib/supabase.ts` | `pullFromSupabase` / `pushToSupabase` |
| `components/dashboard/PeakRing.tsx` | Sleep timer Start/Stop button, ring UI |
| `components/layout/NotificationPanel.tsx` | Water + sleep timer notifications |
| `components/sleep/SleepTracker.tsx` | Sleep chart + stats |
| `components/weight/WeightTracker.tsx` | Weight chart + form |
| `components/gym/GymCalendar.tsx` | Consistency calendar heatmap |
| `components/gym/WorkoutLog.tsx` | Workout logging form |
| `components/gym/StrengthChart.tsx` | Per-exercise strength trend charts |

## Environment Variables (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Data Sources
- LocalStorage with Supabase sync via `dashboard_state` table
- Zustand store hydrated from localStorage
- Weight: direct localStorage (`weight_entries_v1`), reloaded on `syncCount` change
- Gym logs: stored in `gym_dashboard_v1` via Zustand `gym.logs`
- Sleep log: `sleep_log` key in localStorage

## User Preferences
- Default sleep hours: 8
- Sleep timer notification interval: 45 min
- Water timer default: 45 min
- Default awake, not sleeping
