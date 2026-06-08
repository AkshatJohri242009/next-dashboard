# LifeOS — User Experience Principles

---

## Core UX Philosophy

LifeOS is a **Personal Operating System** — not an app, not a dashboard. The difference:
- An app has a purpose you visit. LifeOS is a **place you live**.
- A dashboard shows data. LifeOS shows **state** — where you are, what matters, what's next.
- A tool helps you do one thing. LifeOS helps you **become** — healthier, smarter, more intentional.

---

## The Three Second Rule

Every screen must communicate within 3 seconds:
1. **What is this?** — The route title + primary visual anchor (score ring, graph, agent avatar)
2. **Why does it matter?** — The key metric or state indicator (life score, streak, pending count)
3. **What do I do?** — The primary action (log, add, review, start)

Applied to LifeOS:
- Home: Life Score ring → TodaysMission count → Add goal CTA
- Health: Water level → Supplement status → Log water
- Learning: Subject progress bars → Weak topic alert → Start study
- JARVIS: Agent thinking indicator → Briefing summary → Ask a question

---

## Attention Architecture

### Information Tiers

Every screen has three tiers of information density:

| Tier | Purpose | Visual Treatment | Example (Home) |
|------|---------|-----------------|----------------|
| **Primary** (60%) | The one thing to focus on | Large, high contrast, often animated | AI Briefing with life score ring |
| **Secondary** (30%) | Supporting state | Cards with glass background | TodaysMission, HabitsModule |
| **Tertiary** (10%) | Utility, navigation, context | Small, low contrast, border-only | Quick Access grid, GoalTicker |

### Never Create Equal-Weight Layouts

- The home page is not a grid of equal cards. The AI Briefing (hero) occupies 60% of the viewport.
- The rest flows beneath: mission → habits → quick access → ticker.
- On detail pages (gym, sleep, stocks): the chart or primary metric is the hero; the log/table is secondary.

---

## Navigation Model

### Dual-Mode Navigation

LifeOS has two modes, each with its own sidebar structure:

**Work Mode (default):**
- Dashboard (Home, Journal, Habits, Missions)
- Health (Health, Gym, Weight, Sleep)
- Data (Stocks, Projects, OpenCode)
- JARVIS (Odyssey, Voice, Briefings, Memory, Correlations, Future, Report)

**Study Mode:**
- Dashboard (Overview, Stats)
- Tasks (Tasks, Exams)
- Resources (Files, Sounds, Commute)

### Navigation Principles

1. **Keyboard is primary navigation** — Cmd+K command palette (via JARVIS) should reach any route in 2 keystrokes.
2. **Top chrome is minimal** — 3 CTAs max: Mode toggle, Notifications, Profile.
3. **Sidebar is workspace, not marketing** — mirrors user's structure, not company structure.
4. **Mode toggle preserves context** — saves last-visited path per mode, navigates on switch.
5. **Quick Access on home** — 14 grid links for power users to jump anywhere.

---

## Data Density

### Sparse vs. Rich

LifeOS deliberately varies information density by context:

| Context | Density | Principle |
|---------|---------|-----------|
| Home / Overview | **Sparse** | Scanning — find your state quickly |
| Detail pages / Logs | **Rich** | Acting — all data visible |
| Charts / Graphs | **Medium** | Analyzing — trend visible, outliers highlighted |
| Settings / Config | **Minimal** | Configuring — one thing at a time |

### Progressive Disclosure

- **List view**: shows minimal info (title, status, priority, assignee for missions)
- **Detail view**: shows everything (full description, history, metadata)
- **Edit view**: inline or modal, never a separate page

### Card Content Limits

- **Issue/Mission cards**: title + status + priority + date — that's it. Everything else is one click away.
- **Metric cards**: value + label + trend arrow — never more than one comparison.
- **Habit cards**: name + streak + toggle — no history until you drill in.

---

## Feedback System

### Interaction Feedback Map

| Action | Visual Feedback | Motion |
|--------|----------------|--------|
| Hover (card) | Background shift + border intensifies + brand glow | `translateY(-1px)` over 300ms |
| Hover (button) | Background lightens | `scale(1.04)` over 200ms |
| Press (button) | Scaled down | `scale(0.96)` over 200ms |
| Toggle on | Background turns brand green, thumb slides | 200ms cubic-bezier |
| State change | Brief highlight or badge flash | 200ms |
| Loading | Skeleton or shimmer | Shimmer 2s linear |
| Success | Brand badge appears | Slide-up 300ms |
| Failure | Danger insight card | Slide-up 300ms |
| Agent thinking | Streaming text + terminal output | Character-by-character reveal |

### Notification Hierarchy

| Severity | Visual | Behavior |
|----------|--------|----------|
| Alert (JARVIS proactive) | Bell icon + badge count + panel | Auto-detected (no goals by 2pm, low water) |
| Success | Inline badge + brief toast | Auto-dismiss after 3s |
| Error | Danger insight card | Persistent until dismissed |
| Info | Accent toast | Auto-dismiss after 5s |

---

## User Psychology

Applied cognitive principles across LifeOS:

| Principle | Application |
|-----------|------------|
| **Peak-End Rule** | Life Score, streaks, and yearly reports highlight peak achievements and ending trend |
| **Goal Gradient Effect** | Progress bars on missions, habits, subjects show completion % — users accelerate near the end |
| **Loss Aversion** | Streak counters (study, habits) — breaking a streak is more motivating than maintaining it |
| **Progress Bias** | Every interaction provides immediate feedback (toggle, badge, animation) — user feels progress constantly |
| **Hick's Law** | Never more than 3 primary CTAs per screen. Quick Access grid is secondary (power users) |
| **Fitts's Law** | Primary action is always in the same position (top-right or bottom of relevant card) |
| **Miller's Law** | Chunk related info: habits grouped by type, stats by period, goals by priority |

---

## Onboarding

LifeOS has no traditional onboarding. Instead:

1. **Zero state design** — every empty section shows a helpful prompt: "Log your first habit", "Add your first goal", "Start your first journal entry"
2. **Progressive discovery** — features reveal through use, not through a tour. JARVIS proactively suggests features based on detected behavior.
3. **The agent teaches** — JARVIS explains features conversationally when the user asks "What can I do here?"

---

## Accessibility Requirements

- **Touch targets**: minimum 28px (`h-8`) on all interactive elements
- **Focus indicators**: `.ios-focus-ring` — 3px accent glow at 40% opacity, 8px radius
- **Screen readers**: all icons have `aria-label`, all charts have accessible fallback data
- **Reduced motion**: animations degrade gracefully via `prefers-reduced-motion`
- **Color independence**: state is communicated through icon + text + color, never color alone
- **Light mode**: full light theme available via `.light` class toggle

---

## Conversion Design

LifeOS doesn't sell. But every screen still has a primary goal:

| Screen | Primary Goal | Primary Action | Success State |
|--------|-------------|----------------|---------------|
| Home | Understand my current state | Review AI Briefing | Life Score visible + missions loaded |
| Health | Stay hydrated/supplemented | Tap water glass or supplement | Visual confirmation + streak updated |
| Gym | Log workout | Fill workout form + submit | Entry appears in calendar |
| Journal | Capture today's feeling | Write + save | Entry added to timeline |
| Learning | Track study progress | Update chapter + score | Progress bar fills |
| Sleep | Log sleep | Start/stop sleep timer | Sleep hours recorded |
| JARVIS | Get personalized help | Type or speak a question | Streaming response |

If the user asks "What do I do?" the design failed.
