# LifeOS — Component Library

---

## Component Map by Domain

### Layout
| Component | Purpose |
|-----------|---------|
| `TopNav` | Global navigation bar with mode toggle, notifications, profile |
| `Sidebar` | Contextual sidebar (Work mode / Study mode) |
| `ClientLayout` | Root layout with AnimatePresence page transitions and JARVIS alert polling |
| `NotificationPanel` | Bell notification panel with JARVIS alerts + water/sleep reminders |

### Home (Command Center)
| Component | Purpose |
|-----------|---------|
| `LifeScore` | Animated score ring with 6 weighted dimensions, info toggle showing formula |
| `AIBriefing` | JARVIS-powered daily briefing (hero section, ~60% viewport) |
| `TodaysMission` | Goal creation (priority + due date + estimate), pending goals list with carry-over |
| `AIRecommendations` | JARVIS-suggested actions (currently hardcoded, planned dynamic) |
| `LearningProgress` | 4-column subject progress (Physics/Chemistry/Math/CS) |
| `HabitsModule` | Quick habit toggle with streak display |
| `GoalTicker` | Marquee-style scrolling goals |
| `QuickAccess` | 14-link grid for power navigation |

### Life OS
| Component | Purpose |
|-----------|---------|
| `JournalModule` | Mood-based daily journaling with analytics charts |
| `HabitsModule` | Dedicated habit tracking page with stats |
| `LearningOSModule` | Subject-based chapter tracking, scores, revision cycle, weak topic detection |
| `MissionsModule` | Long-term missions with milestones and progress |
| `LifeTimeline` | Chronological life events with category filters |
| `DecisionLog` | Major choices with options, outcomes, reflection, analytics |
| `ForecastEngine` | Weekly/monthly projections and habit trend analysis |
| `AutomationPanel` | 6 one-click automations (study plan, workout, schedule, review, organize, priorities) |
| `KnowledgeGraph` | SVG-connected idea graph visualization |

### Health
| Component | Purpose |
|-----------|---------|
| `WaterTracker` | Water glass logging with daily goal progress |
| `SupplementScheduler` | Supplement timing with checkmarks |
| `WorkoutLog` | Exercise logging with sets/reps/weight |
| `GymCalendar` | Calendar view of workouts |
| `StrengthChart` | Strength progression chart |
| `ProgressPhotos` | Photo gallery with date stamps |
| `WeightTracker` | Weight logging with trend chart |
| `SleepTracker` | Sleep logging with 7-day avg chart |
| `SleepTimer` | Start/stop sleep timer (auto-expires after 16h) |

### JARVIS 2.0 Intelligence
| Component | Purpose |
|-----------|---------|
| `JarvisChat` | Full AI chat with auth, sessions, streaming SSE, tool calling |
| `VoiceButton` | Floating microphone button, Web Speech API |
| `VoiceBriefingPanel` | Daily/weekly/monthly AI briefings with speak-aloud |
| `VoiceJournalModal` | Voice-to-journal entry |
| `MemoryAmplifier` | Life Memory Engine — search, filter, auto-extract, stats |
| `CorrelationPanel` | Sleep→mood, gym→productivity, hydration→mood pattern discovery |
| `FutureSelfPanel` | 3/6/12 month projections with risk/opportunity flags |
| `LifeReportCard` | Annual "Spotify Wrapped for life" report |
| `SettingsPanel` | JARVIS settings (inside JarvisChat) |

### Study Mode
| Component | Purpose |
|-----------|---------|
| `StudyCalendar` | Study session calendar |
| `StudyTimer` | Focus timer with start/stop |
| `FocusSounds` | Web Audio API noise generator (white/pink/brown/rain) |
| `StudyStats` | Test scores and error log |
| `StudyTasks` | Task list with streak counter |
| `ExamDates` | Exam countdowns |
| `StudyFiles` | File uploads (base64, 10MB limit) |
| `CommuteTimer` | Airport flight timer using Haversine formula |

### Data
| Component | Purpose |
|-----------|---------|
| `StockList` | Portfolio list with Yahoo Finance quotes |
| `StockDetail` | Per-stock history chart |
| `ProjectTracker` | Project management |
| `WebDAV` | OpenCode file manager |

---

## Design System Components

All located in `components/ui/`:

| Component | Class/Tag | Purpose |
|-----------|-----------|---------|
| Glass Card | `.glass`, `.glass-sm`, `.glass-strong`, `.glass-elevated` | Content containers at 5 depth levels |
| Tinted Glass | `.glass-tinted`, `.glass-accent` | Brand/accent emphasis containers |
| Vibrant Glass | `.glass-vibrant`, `.glass-strong-vibrant` | Saturated variants for text-rich content |
| Card Hover | `.card-hover` | Interactable card with lift + glow on hover |
| Elevated Card | `.card-elevated` | Pre-styled elevated card with `--radius-lg` |
| iOS Button | `.ios-btn-{primary|secondary|destructive|ghost}` | 4 variants, 12px radius, scale on press |
| Segment Control | `.segment-control` + `.segment-item.active` | iOS-style pill toggle, glass back on active |
| iOS Toggle | `.ios-toggle` | 44×28px switch, brand green active |
| Badge | `.badge-{success|warning|danger|info|brand|neutral}` | Status pills, tinted background |
| Insight Card | `.insight-card{-accent|-warning|-danger}` | 3px left border, tinted back. For warnings/tips |
| Glow Dot | `.glow-dot-{green|amber|red|blue}` | 8px status indicator with matching shadow glow |
| Score Ring | `.score-ring` | Circular progress with 1.5s dashoffset transition |
| Metric Display | `.metric-value` + `.metric-label` | Large number + uppercase label |
| Section Label | `.section-label` | Monospace uppercase label with brand bar |
| KBD | `.kbd` | Keyboard shortcut display |
| Divider | `.divider` | 0.5px horizontal rule |

### Typography Classes

| Class | Usage |
|-------|-------|
| `.hero-title` | Page hero (800 weight, -0.03em tracking) |
| `.hero-subtitle` | Hero supporting text (400 weight, secondary color) |
| `.page-title` | Route page header (700 weight) |
| `.section-title` | Section headers (600 weight) |
| `.section-heading` | Small section label (600 weight, 0.875rem) |
| `.label-large` | Card titles, list items (590 weight) |
| `.label-medium` | Secondary labels (510 weight) |
| `.label-small` | Tertiary labels (510 weight, secondary color) |
| `.footnote` | Fine print (400 weight, tertiary color) |
| `.text-gradient` | Fade text from full → 80% opacity |
| `.text-gradient-brand` | Brand green → accent blue |
| `.text-gradient-primary` | Brand → teal → accent |

---

## Agent UI Components

JARVIS and AI agents have their own visual language distinct from human UI:

| Element | Visual Language |
|---------|----------------|
| Agent avatar | Circular, distinct from human profile photos |
| Thinking indicator | Streaming text + animated dots + terminal output |
| Tool execution | Inline card showing what tool ran and what happened |
| Alert banner | Bell notification panel, JARVIS-initiated |
| Briefing card | Structured AI output in glass card with gradient accent |
| Session list | Chat history with preview text |

---

## Interaction Patterns

### Card Hover
```
Background: color-mix(in srgb, var(--text) 5%, transparent)
Shadow: glass-edge + brand glow + elevated shadow
Transform: translateY(-1px)
Duration: 300ms cubic-bezier(0.22, 1, 0.36, 1)
```

### Button Press
```
Transform: scale(0.97)
Duration: 200ms cubic-bezier(0.22, 1, 0.36, 1)
```

### Page Enter
```
Opacity: 0 → 1
Y: 10px → 0
Duration: 300ms cubic-bezier(0.22, 1, 0.36, 1)
```

### Stagger List Enter
```
Each child: opacity 0 → 1, Y 8px → 0
Delay cascade: 0ms, 80ms, 160ms, 240ms, 320ms, 400ms, 480ms, 560ms
Duration: 400ms
```

### Micro-interactive Scale
```
Hover: scale(1.04)
Press: scale(0.96)
Duration: 200ms
```

### Micro-interactive Lift
```
Hover: translateY(-1px) + box-shadow(0 8px 24px rgba(0,0,0,0.3))
Press: translateY(0)
Duration: 200ms
```
