# My Dashboard

A personal dashboard with AI assistant, health tracking, gym logging, weight tracking, and Supabase sync. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## How It Was Made

This app was built from scratch as a modern replacement for a static HTML health dashboard. The goal was a single-page PWA that works on both laptop and mobile, with data syncing across devices — all using entirely free services.

### Architecture

- **Next.js 14 App Router** — 6 routes (`/`, `/health`, `/gym`, `/weight`, `/api/chat`, `/_not-found`) with SSR, static generation, and an API route for the AI proxy.
- **Zustand + localStorage** — All state (goals, health data, gym logs, reminders) lives in a Zustand store persisted to localStorage. This means instant load with no server round-trip.
- **Supabase** — On startup, the app syncs local state to a Supabase `dashboard_state` table. When you switch devices, remote data is pulled and merged. This is the only backend dependency.
- **Gemini API** — The AI Assistant panel calls a Next.js API route (`/api/chat`) which proxies to Google's Gemini API. It tries `gemini-2.0-flash` first (free tier, 60 req/min), falls back to `gemini-2.5-flash`.
- **Notifications** — Uses the Browser Notification API for system-level alerts. A polling interval checks for due reminders and water timer expiry every 15 seconds.

### Design System

Custom glassmorphism design built on Tailwind: frosted glass panels (`backdrop-blur-xl`), subtle border glows, dark background (`#050506`), and a green/blue/amber color palette. All animations use Framer Motion with a cubic-bezier easing curve for smooth feel.

### Key Design Decisions

| Decision | Why |
|----------|-----|
| Zustand over Redux | Minimal boilerplate, built-in localStorage persistence |
| Framer Motion Reorder | Drag-to-reorder todo list with smooth layout animations |
| Recharts over Chart.js | React-native chart components, responsive containers |
| Lucide over Heroicons | Consistent 24px stroke-based icon set |
| Netlify over Vercel | User already had a Netlify account |
| App Router over Pages Router | Modern Next.js patterns, layouts, server components |

## User Guide

### Dashboard (`/`)

- **Goal Ticker** — Rotates through your incomplete goals. The counter shows `done/total`. All done? The card glows green.
- **Peak Ring** — The ring fills as the day progresses. Color shifts from warm (morning) to cool (night) based on your sleep, hydration, and time of day. Drag the sleep slider to see how it affects your peak.
- **Sleep Timer** — Click "Start Sleep Timer" to begin tracking. The app reminds you to turn it off at 30, 60, and 90 minutes.
- **Todo List** — Add goals with optional timers (enter minutes next to the Add button). Drag to reorder, click the zap to queue, click the timer icon on any goal to set/change its reminder. Use "Push" to move unfinished goals to tomorrow.

### Health (`/health`)

- **Supplement Scheduler** — Three windows (morning, lunch, evening). The active window pulses. Check items off as you take them. Tag items as "LOW" if you're running out.
- **Water Tracker** — Enter your weight, age, workout hours, caffeine, and stimulants. The formula calculates a dynamic water goal. Click `+300ml` or `+500ml` to log drinks. The notification bell reminds you to hydrate every 30 minutes.

### Gym (`/gym`)

- **Workout Log** — Select a split (Push/Pull/Legs/etc), then log exercises with sets, weight, and reps. If you hit all reps across all sets, you'll see a `+2kg` progressive overload nudge.
- **Strength Trends** — Area charts per exercise showing weight progression over time.
- **Progress Photos** — Upload before/after photos with the dashed drop zones.

### Weight (`/weight`)

- Log daily weight with optional notes. The chart shows your trend over time with a green area fill. The +/- delta indicator compares your latest two entries.

### AI Assistant

Click the sparkle icon (top bar) or the AI button in the sidebar to open the chat panel. Ask anything about your data, health tips, workout advice — it's powered by Gemini.

### Notifications (Bell Icon)

The bell badge shows a count of pending tasks + active reminders + overdue items. Open it to see:
- Overdue reminders
- Hydrate now alerts (from the water timer)
- Pending tasks
- Water remaining for the day
- Upcoming reminders with countdowns
- Set new reminders (choose type: task/gym/water, enter text, set minutes)

### Sleep Timer

On the dashboard PeakRing card, click "Start Sleep Timer". The timer runs in the background. At 30, 60, and 90 minutes, you'll get system notifications asking if you want to turn it off. When you stop it, a "Slept for X min" entry appears in your notifications.

### Cross-Device Sync

Data syncs via Supabase automatically on page load. To see your data on another device, just open the app — no login needed. The Supabase table uses a single row for all dashboard state.

### Mobile Usage

Open the site in Chrome/Safari, then **Add to Home Screen** for a native-like PWA experience:
- **Android**: Chrome menu → Add to Home screen
- **iOS**: Share → Add to Home Screen
- The app icon and "My Dashboard" label will appear on your home screen
- Tap it to open in full-screen standalone mode with no browser chrome

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom glassmorphism design system |
| Animation | Framer Motion |
| State | Zustand + localStorage |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Gemini API (`gemini-2.0-flash` → `gemini-2.5-flash`) |
| Sync | Supabase |
| Hosting | Netlify (auto-deploy from GitHub) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

- **Supabase**: Create a free project at [supabase.com](https://supabase.com), then run `supabase-schema.sql` in the SQL Editor to create the `dashboard_state` table.
- **Gemini**: Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Deployment

Auto-deployed to Netlify from the `master` branch. Every push triggers a build:

```bash
git add -A
git commit -m "your message"
git push
```

## Project Structure

```
├── app/              # Next.js routes (/, /health, /gym, /weight, /api/chat)
├── components/       # React components
│   ├── dashboard/    # GoalTicker, PeakRing, TodoList
│   ├── gym/          # WorkoutLog, StrengthChart, ProgressPhotos
│   ├── health/       # SupplementScheduler, WaterTracker
│   ├── layout/       # Sidebar, TopNav, AIPanel, CommandPalette, NotificationPanel
│   ├── ui/           # GlassPanel, Button
│   └── weight/       # WeightTracker
├── lib/              # Store, utils, types, supabase client, media query hook
└── public/           # Static assets, manifest, app icon
```
