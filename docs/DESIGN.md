# LifeOS — Design System

> Generated June 6, 2026 from the SUPREME PRODUCT DESIGN AGENT OMEGA V4 framework. Design preferences master file: `C:\Skills and Website preferences\WEB_DESIGN_PREFERENCES.md`

---

## Design Philosophy

LifeOS is an AI-powered Personal Operating System. It is not a dashboard — it is a command center for your life. Every design decision serves three masters: **clarity**, **calm**, and **capability**.

1. **Clarity** — The user must understand their state at a glance. Information density varies by context: sparse when scanning, rich when acting.
2. **Calm** — The interface recedes. Glass reduces visual weight. Motion is purposeful. The data is the hero, not the chrome.
3. **Capability** — Every pixel earns its place. JARVIS is a first-class citizen. Agents have their own UI language.

---

## Visual Identity

### Brand Colors

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--brand` (Green) | `#30D158` | `#34C759` | Primary actions, success states, active indicators |
| `--accent` (Blue) | `#007AFF` | `#007AFF` | Links, secondary actions, info badges |
| `--system-red` | `#FF453A` | `#FF3B30` | Danger, destructive actions, errors |
| `--system-orange` | `#FF9F0A` | `#FF9500` | Warnings, medium priority |
| `--system-yellow` | `#FFD60A` | `#FFCC00` | Highlights, low priority |
| `--system-purple` | `#BF5AF2` | `#AF52DE` | Ambient third glow, creative accents |

### Neutral Palette

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--bg` | `#000000` | `#F2F2F7` | Root canvas (extreme black for glass contrast) |
| `--bg-secondary` | `#08080A` | `#FFFFFF` | Secondary surfaces |
| `--bg-elevated` | `#0A0A0D` | `#FFFFFF` | Cards, elevated panels |
| `--text` | `#FFFFFF` | `#1C1C1E` | Primary content |
| `--text-secondary` | `rgba(255,255,255,0.7)` | `rgba(60,60,67,0.6)` | Supporting text |
| `--text-tertiary` | `rgba(255,255,255,0.4)` | `rgba(60,60,67,0.3)` | Captions, metadata |
| `--text-muted` | `rgba(255,255,255,0.2)` | `rgba(60,60,67,0.15)` | Placeholder, disabled |
| `--border` | `rgba(255,255,255,0.06)` | `rgba(60,60,67,0.07)` | Subtle separators |
| `--border-strong` | `rgba(255,255,255,0.12)` | `rgba(60,60,67,0.15)` | Card borders, focus |

---

## Liquid Glass System

LifeOS uses a **5-layer frosted glass system** inspired by iOS and Apple's Liquid Glass design language. Each layer is more opaque as depth increases. The glass pops because ambient body glows are visible through the blur.

### Layer Hierarchy

| Layer | Background | Blur | Usage |
|-------|-----------|------|-------|
| **Ultra-thin** | `rgba(255,255,255,0.04)` | 12px | Background decorations, subtle overlays |
| **Thin** | `rgba(30,30,35,0.55)` | 24px | Nav bars, top chrome |
| **Default** | `rgba(30,30,36,0.62)` | 40px | Cards, content panels |
| **Strong** | `rgba(38,38,44,0.72)` | 60px | Sidebars, prominent panels |
| **Elevated** | `rgba(48,48,55,0.82)` | 80px | Modals, flyouts, dialogs |

### Tinted Variants

- **Tinted (brand)**: Green-tinted glass for emphasis — `rgba(48,209,88,0.14)` with brand edge glow
- **Tinted (accent)**: Blue-tinted glass for info — `rgba(10,132,255,0.14)` with accent edge glow

### Glass Edge System

Every glass layer has a `0.5px` top edge highlight (light catch) and a grounded shadow below:
- **Dark**: White edge highlight + deep black shadow (opacity 0.4–0.6)
- **Light**: Subtle gray edge + soft shadow (opacity 0.04–0.08)

### CSS Classes

- `.glass` — Default card depth
- `.glass-sm` — Thin (nav bars)
- `.glass-ultrathin` — Subtle background
- `.glass-strong` — Sidebar depth
- `.glass-elevated` — Modal depth
- `.glass-tinted` — Brand emphasis
- `.glass-accent` — Accent emphasis
- `.glass-vibrant` — Default + saturate(1.4)
- `.glass-strong-vibrant` — Strong + saturate(1.3)

---

## Typography

Font stack: **Inter** (300–900) for UI, **SF Mono / JetBrains Mono** for code.

### Type Scale

| Token | Size | Weight | Tracking | Line Height | Usage |
|-------|------|--------|----------|-------------|-------|
| Hero | `clamp(2.5rem, 5vw, 4.5rem)` | 800 | -0.03em | 1.05 | Page hero titles |
| Page Title | `clamp(1.75rem, 3vw, 3rem)` | 700 | -0.02em | 1.1 | Route page headers |
| Section Title | `clamp(1.25rem, 1.5vw, 2rem)` | 600 | -0.01em | 1.2 | Section headers |
| Body | 16–18px | 400 | normal | 1.5 | Content text |
| Caption | 12–14px | 500 | 0.02em | 1.4 | Metadata, timestamps |

### iOS Label Styles

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.label-large` | 1rem | 590 | Card titles, list items |
| `.label-medium` | 0.875rem | 510 | Secondary labels |
| `.label-small` | 0.75rem | 510 | Tertiary labels |
| `.footnote` | 0.6875rem | 400 | Legal, footnotes |

### Text Gradients

- `.text-gradient` — Fade from full text to 80% opacity
- `.text-gradient-brand` — Brand green to accent blue
- `.text-gradient-primary` — Brand green → teal → accent blue

---

## Spacing

Base unit: 4px. Key spacing values: 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

| Context | Padding | Gap |
|---------|---------|-----|
| Card content | `p-4 sm:p-6` (16px → 24px) | `gap-4` |
| Page sections | `py-8 sm:py-12` | `gap-8` |
| Page wrapper | `px-4 sm:px-6 lg:px-8` | — |
| Section label → content | — | `mb-4` |
| List items | `px-4 py-3` | — |
| Grid items | — | `gap-3 sm:gap-4` |

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 10px | Buttons, inputs |
| `--radius-md` | 14px | Cards, panels |
| `--radius-lg` | 18px | Elevated cards, modals |
| `--radius-xl` | 24px | Hero sections, large containers |

---

## Motion System

### Core Easing

**Primary**: `cubic-bezier(0.22, 1, 0.36, 1)` — used for all transforms, opacity changes, and entrances.

### Animation Tokens

| Name | Duration | Description |
|------|----------|-------------|
| `float` | 6s ease-in-out | Vertical hover (0 → -6px) |
| `slide-up` | 0.3s ease-out | 12px up + fade |
| `slide-down` | 0.3s ease-out | 12px down + fade |
| `scale-in` | 0.3s cubic-bezier | 0.95 → 1 + fade |
| `stagger-in` | 0.4s ease-out | 8px up + fade (for lists) |
| `fade-in` | 0.2s ease-out | Opacity only |
| `count-up` | 1.5s cubic-bezier | Number reveal |
| `glow-pulse` | 3s ease-in-out | Box-shadow pulse |
| `breathing` | 4s ease-in-out | Opacity pulse (0.6 → 1) |
| `shimmer` | 2s linear | Background sweep |

### Framer Motion Default

```tsx
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
```

### Stagger Delays (via CSS)

```
.stagger-enter:nth-child(1) { animation-delay: 0ms; }
.stagger-enter:nth-child(2) { animation-delay: 80ms; }
.stagger-enter:nth-child(3) { animation-delay: 160ms; }
.stagger-enter:nth-child(4) { animation-delay: 240ms; }
...
```

### Motion Principles (from OMEGA V4)

1. **Motion communicates state, not delight** — transitions for open/close, status change, agent thinking. No idle decoration.
2. **Speed over flash** — all animations <300ms. None are decorative.
3. **Agent motion is first-class** — streaming text, thinking indicators, terminal output have their own motion language.
4. **Micro-interactions** — hover scale (1.04), press scale (0.96), lift translateY(-1px) with elevated shadow.

---

## Component Architecture

### Card System

| Variant | Background | Border | Shadow | Hover |
|---------|-----------|--------|--------|-------|
| Default glass | `--glass-bg` | `--border` | `--glass-shadow` | Background shift + brand glow |
| Elevated | `--glass-strong-bg` | `--border-strong` | `--glass-strong-shadow` | translateY(-2px) |
| Insight (brand) | `color-mix(brand 8%)` | 3px left brand | — | — |
| Insight (accent) | `color-mix(accent 8%)` | 3px left accent | — | — |
| Insight (warning) | `color-mix(orange 8%)` | 3px left orange | — | — |
| Insight (danger) | `color-mix(red 8%)` | 3px left red | — | — |

### Badge System

| Variant | Background | Text Color | Usage |
|---------|-----------|-----------|-------|
| `.badge-success` | Brand 18% | Brand | Completed, active |
| `.badge-warning` | Orange 18% | Orange | Pending, medium priority |
| `.badge-danger` | Red 18% | Red | Overdue, high priority |
| `.badge-info` | Accent 18% | Accent | Informational |
| `.badge-brand` | Brand 22% | Brand | Prominent status |
| `.badge-neutral` | Gray 18% | Gray | Neutral state |

### Button System

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `.ios-btn-primary` | Accent | White | Primary CTA |
| `.ios-btn-secondary` | Text 10% | Accent | Secondary action |
| `.ios-btn-destructive` | Red | White | Destructive action |
| `.ios-btn-ghost` | Transparent | Accent | Tertiary action |

All buttons: 12px radius, `.active` scale(0.97), 590 weight, `-0.01em` tracking.

### Segment Control

iOS-style pill: `--system-gray5` track, active tab gets glass back + blur(20px) + subtle shadow.

### Toggle Switch

44×28px pill, active turns brand green, thumb slides 16px with primary cubic-bezier.

### Score Ring

Circular progress indicator. Transition: `stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)`.

### Glow Dots

8px colored circles with matching box-shadow glow. Variants: green, amber, red, blue.

---

## Ambient Background System

Three layered radial gradients behind all content to make glass blur visible:

1. **Top-right brand glow** — `radial-gradient(ellipse, brand 14% → 4% → transparent)`, 65vw × 80vh at `top: -30vh, right: -15vw`
2. **Bottom-left accent glow** — `radial-gradient(ellipse, accent 10% → 3% → transparent)`, 55vw × 70vh at `bottom: -25vh, left: -10vw`
3. **Center purple halo** — `.bg-ambient-center`, `rgba(purple, 3%) → transparent`, 80vw × 60vh

---

## Dark/Light Mode

Dark is the default. Light mode is triggered by `.light` class on a parent element.

### Light Mode Overrides

Light mode redefines all CSS variables:
- Backgrounds: deep black → warm system gray (`#F2F2F7`)
- Glass: dark frosted → white frosted (65–88% opacity)
- Text: white → nearly black (`#1C1C1E`)
- Borders: white → gray (7–15% opacity)
- Shadows: high opacity (0.4–0.6) → low opacity (0.02–0.08)

Plus 70+ Tailwind utility overrides: `text-white` → `var(--text)`, `bg-white` → `var(--text)`, `border-white` → `var(--text)`, etc.

---

## Accessibility

- **Touch targets**: minimum 28px (`h-8`) on all interactive elements
- **Focus states**: `.ios-focus-ring` — 3px accent glow at 40% opacity, 8px radius
- **Reduced motion**: all animations use standard CSS so `prefers-reduced-motion` is respected
- **Color contrast**: text passes WCAG AA on all glass layers (brand icons/tinted badges may be AA large only)
- **Keyboard**: segment controls and toggle switches are keyboard-navigable
- **Selection**: accent-tinted selection color via `::selection`

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Mobile | <640px | Single column, stack forms `flex-col`, hover-reveal always visible (`opacity-100`) |
| Tablet | 640–1024px | 2-column grids, hover-reveal begins (`sm:opacity-0 sm:group-hover:opacity-100`) |
| Desktop | 1024–1440px | Multi-column, full glass effect visible |
| Wide | >1440px | Content max-width constrained; margins grow |

---

## Design Token Summary

### CSS Variables

```
--brand, --accent, --system-{color}
--bg, --bg-secondary, --bg-elevated
--text, --text-secondary, --text-tertiary, --text-muted
--border, --border-strong
--glass-{layer}-bg, --glass-{layer}-blur
--glass-{layer}-edge, --glass-{layer}-shadow
--radius-{sm|md|lg|xl}
--hero-title, --page-title, --section-title
--safe-top, --safe-bottom, --safe-left, --safe-right
```

### Tailwind Theme Extensions

- `theme-{bg|text|border}` — maps to CSS variables
- `semantic-{success|warning|danger|info}` — semantic color aliases
- `glass-{gradient|border}` — gradient backgrounds
- `glow-{green|amber|accent|brand}` — radial gradient glows
- `shadow-{glass|glow-*|elevated}` — shadow system

### Font Stacks

- **UI**: `Inter` → `system-ui` → `sans-serif`
- **Mono**: `SF Mono` → `JetBrains Mono` → `monospace`
