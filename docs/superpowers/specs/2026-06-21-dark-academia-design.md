# Dark Academia — UI Premiumization Design

**Date:** 2026-06-21  
**Status:** Approved  
**Target:** Full-application UI upgrade — color, typography, surfaces, layout, motion

## Overview

Transform the productivity-chatbot from its current graphite + lavender theme into a Dark Academia aesthetic — scholarly, warm, tactile. The upgrade touches every surface: color palette, typography, layout architecture, surface textures, and restrained motion. The app should feel like a high-end leather notebook, not a generic dashboard.

## 1. Color Palette

### Base Canvas
- **Background:** `#1a0f0f` — deep oxblood/burgundy charcoal. Red-leaning warmth, not clinical black.
- **Card surface:** `#241615` — slightly lifted from base
- **Elevated (dialogs, popovers):** `#2a1a18` — further lifted
- **Input backgrounds:** `#1e1211` — inset, slightly darker than cards

### Text Hierarchy
| Level | Hex | Usage |
|-------|-----|-------|
| Primary | `#f0e6d3` | Default body text, headings |
| Secondary | `#c4b598` | Supporting text, metadata |
| Muted | `#8a7a6a` | Disabled, placeholder, tertiary info |

### Accent
- **Primary accent (gold/brass):** `#c9a94e` — active nav indicator, primary buttons, focus rings, priority badges, sidebar border, chat user-bubble edge
- Used on ~5% of elements. Restrained, meaningful.

### Semantics
- **Success:** `#7a9a5a` — muted olive, organic fit
- **Destructive:** `#b85c5c` — warm desaturated rose
- **Border:** `rgba(240, 230, 211, 0.08)` — parchment-tinted, whisper-thin

## 2. Typography

### Font Stack
- **Headlines:** Crimson Text (Google Fonts, serif) — weights 400, 600
  - Page titles: 600, -0.02em letter-spacing
  - Card titles: 400
- **Body & UI:** Geist Sans (already loaded) — weights 300, 400, 500
  - Body: 400, line-height 1.6
  - Labels/meta: 300
- **Data & monospace:** Geist Mono (already loaded) — counts, dates, code

### Scale
| Size | Usage | Font + Weight |
|------|-------|---------------|
| 30px (text-3xl) | Page headings | Crimson Text 600 |
| 20px (text-xl) | Card titles | Crimson Text 400 |
| 14px (text-sm) | Body, chat messages | Geist 400 |
| 12px (text-xs) | Labels, metadata | Geist 300 |
| 11px | Micro text, badges | Geist 300, uppercase tracking-wide |

### Style Rules
- Page headings use sentence case. Dashboard date in Crimson Text italic.
- Gold accent color for inline links, not underlined.

## 3. Surface Quality

### Noise Grain
- SVG noise pattern as `background-image` on body, 3% opacity
- Creates paper/leather depth without visual noise

### Depth Strategy: Surface Elevation (no shadows)
- Cards are slightly lighter than background
- Dialogs/popovers one step lighter than cards
- Borders replace shadows for definition
- Gold border (1px) on active/high-emphasis elements

### Card Treatment
- Rounded-lg (10px)
- Parchment-tinted border: `rgba(240,230,211,0.06)`
- Hover: lifts 2px via `translateY(-2px)`, 200ms ease-out
- No gradients, no glass effects

### Scrollbar
- Thin (6px), gold-tinted thumb on dark track

## 4. Layout Architecture

### Global
- Sidebar: 240px, same background as canvas, subtle right border
- Content: flex-1 with generous padding (p-8 on desktop)
- Max content width: 5xl for dashboard, 3xl for list pages

### Sidebar Refinements
- Header: serif wordmark "Productivity" in gold, small caps
- "New chat": gold-bordered pill button (outline → filled on hover, 200ms)
- Nav items: 2px gold left-border on active state (not background fill). Border animates 0→2px on hover (150ms)
- Logout: subtle text link at bottom, muted color

### Dashboard — Bento Grid
```
┌─────────────────────────┬──────────┐
│ Today at a Glance       │ Quick    │
│ (date, task count,      │ Stats    │
│  next event preview)    │ (3 stats)│
│                         │          │
├─────────────────────────┴──────────┤
│ Recent Notes    │ Upcoming Tasks   │
│ (list)          │ (list)           │
└─────────────────┴──────────────────┘
```

- Hero card: 2-column span, shows date in italic serif, prominent upcoming-task count, next calendar event preview
- Quick stats: 1-column, stacked metric cards (tasks done, notes count, events today)
- Bottom row: 2 equal cards — recent notes and upcoming tasks
- View-all links: gold text, no underline

### Tasks/Notes Pages
- Keep current structure, add:
  - Gold section dividers between create-form and list
  - Refined card hover with gold edge highlight on mouse proximity
  - Loading skeletons while data fetches

### Calendar
- Gold-tinted "today" cell indicator
- Day cell hover: subtle box-shadow glow (gold tinted) instead of just color shift
- Event pills on cells: 1px gold left-border

### Chat
- Current bubble layout kept
- User bubbles: gold-tinted left edge (1px)
- Assistant bubbles: neutral, warm parchment tint
- Thinking indicator: 3 gold dots, fade-in sequence (400ms stagger)
- Input bar: gold focus ring, gold send button

## 5. Motion & Micro-Interactions

### Page Transitions
- CSS view transitions: 300ms fade + 8px vertical slide on route change
- Applies to all route changes: Dashboard ↔ Tasks ↔ Notes ↔ Calendar ↔ Chat

### Components
| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Sidebar nav hover | Mouse enter | Gold left-border 0→2px | 150ms | ease-out |
| "New chat" pill | Hover | Gold fill sweeps L→R | 200ms | ease-out |
| Card hover | Mouse enter | translateY(-2px) + subtle shadow | 200ms | ease-out |
| Dialog open | Trigger click | scale(0.96→1.0) + fade | 200ms | ease-out |
| Dialog close | Close/Escape | scale(1.0→0.96) + fade | 150ms | ease-in |
| Checkbox toggle | Click | scale bounce 1→1.1→1 | 150ms | ease-out |
| Chat message | New message | fade + slide from speaker side | 200ms | ease-out |
| Thinking dots | AI processing | 3 dots fade-in sequence | 400ms stagger | ease-out |
| Loading skeleton | Page load | Shimmer L→R with gold tint | 1.5s loop | linear |

### Dashboard Card Entrance
- Staggered reveal on initial load only:
  - Card 1: 0ms delay
  - Card 2: 50ms delay
  - Card 3: 100ms delay
  - Each: fade + slide up 4px, 300ms

### Loading States
- Skeleton placeholders: warm gray bars matching card shapes
- Shimmer animation: gold-tinted gradient sweeping L→R, 1.5s loop
- Applied on: tasks list load, notes list load, events fetch, chat history load

## 6. Implementation Notes

### Dependencies
- `framer-motion` — for page transitions, staggered reveals, dialog animations
- `@fontsource/crimson-text` — for serif headline font
- No new dependencies for noise texture (SVG-in-CSS) or scrollbar (CSS only)

### Files Touched
| File | Changes |
|------|---------|
| `app/globals.css` | Full palette rewrite, noise texture, scrollbar, heading font |
| `app/layout.tsx` | Page transition wrapper (AnimatePresence) |
| `components/sidebar.tsx` | Gold refinenents, active border indicator, new chat pill |
| `app/page.tsx` | Bento grid dashboard, staggered card entrance, skeleton loading |
| `components/chat-panel.tsx` | Gold accents, thinking dot animation, message entrance |
| `components/task-list.tsx` | Gold edge hover, skeleton loading, refined cards |
| `components/task-form.tsx` | Gold buttons |
| `components/note-list.tsx` | Gold edge hover, skeleton loading |
| `components/calendar-view.tsx` | Gold hover glow, event border, today indicator |
| `components/auth-form.tsx` | Gold button, refined inputs |
| `app/tasks/page.tsx` | Page transition |
| `app/notes/page.tsx` | Page transition |
| `app/calendar/page.tsx` | Page transition |
| `app/chat/page.tsx` | Page transition |
| `components/ui/button.tsx` | Gold primary variant |
| `components/ui/input.tsx` | Refined input styling |
| `components/ui/card.tsx` | Dark academia card base |

### Font Loading
- Add `Crimson_Text` to `next/font/google` import in `app/layout.tsx`
- CSS variable `--font-serif` for Crimson Text
- Keep Geist Sans as `--font-sans`, Geist Mono as `--font-mono`

### CSS Noise Texture
```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,...");
  pointer-events: none;
  z-index: 9999;
}
```

## 7. Verification

- TypeScript compiles clean (`npx tsc --noEmit`)
- ESLint passes (`npx eslint . --ext .ts,.tsx`)
- No HTML nesting violations
- Playwright smoke test: all pages render, CRUD operations work
- Console error count: zero
- Visual: gold accent appears on exactly the right elements (not overused)
- Motion: `prefers-reduced-motion: reduce` disables all animations
