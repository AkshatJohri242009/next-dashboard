# My Dashboard

A personal dashboard with AI assistant, health tracking, gym logging, weight tracking, and Supabase sync. Built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Dashboard** — Goal ticker, energy peak window, drag-reorderable todo list with push-to-tomorrow
- **Health** — Supplement scheduler with active window alerts, water intake calculator with stimulant formula
- **Gym** — Workout log with split selector, progressive overload targets, strength trend charts, before/after photos
- **Weight** — Daily weight logging with trend chart and +/- delta
- **AI Assistant** — Gemini-powered chat panel (free tier, `gemini-2.0-flash`)
- **Notifications** — Bell panel showing pending tasks, water remaining, timed reminders, water drink timer
- **Supabase Sync** — Cross-device data sync via Supabase free tier
- **PWA Ready** — Manifest, app icon, `Add to Home Screen` support
- **Responsive** — Off-canvas mobile sidebar, full-width AI panel, adaptive grids

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
