# AEROSENSE Design System

This document defines the visual language, typography, color system, 2D artwork schedule, icon rules, and structural conventions for the AEROSENSE web platform. All new views and updates must follow these specifications so the interface stays cohesive, calm, and legible.

## 1. Visual Direction

**Aesthetic**: Coastal Atmospheric Observatory — airy sky-blue clarity paired with handcrafted 2D environmental artwork.

AEROSENSE is a public and operational environmental observatory for Indonesian communities and industrial areas. The interface should feel approachable, unified, and trustworthy: clean sky-blue atmospheric surfaces, crisp white data sheets, and time-aware 2D illustrations without generic dark-mode clichés or mismatched styling across sections.

## 2. Color System

The palette uses AEROSENSE's signature airy sky-blue canvas, crisp white data sheets, deep maritime ink, and a single disciplined cobalt accent. **Lavender, violet, and purple hues are strictly forbidden across all surfaces, badges, illustrations, and charts.**

### Core Tokens

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Canvas ground | `--aero-canvas-soft` | `#EAF5FF` | Application background |
| Base background | `--background` | `#F3F8FF` | Document background |
| Primary sheet | `--aero-surface` | `#FFFFFF` | Main content panels and data sheets |
| Sidebar surface | `--sidebar` | `#F8FCFF` | Navigation sidebar |
| Structural hairline | `--aero-rim` | `#CDDFF0` | `1px` panel borders |
| Primary ink | `--aero-ink` | `#102A47` | Headings, primary data values, active copy |
| Secondary ink | `--aero-muted` | `#3F5F79` | Descriptions, metadata, timestamps (WCAG AA+) |
| Primary accent | `--aero-blue` | `#0868DC` | Primary actions, links, active navigation state |
| Primary accent hover | `--aero-blue-hover` | `#0758BE` | Hover and active feedback for primary actions |
| Accent tint | `--accent` | `#E7F2FF` | Active sidebar item and selected option surface |

### Semantic Status & Tonal Chips (Borderless Only)

Status tags, alert strips, and row cards use **borderless soft tonal fills** (`border: 0`)—never a colored box wrapped in a darker colored `1px` outer outline.

| Tone | Foreground | Background | Border |
| :--- | :--- | :--- | :--- |
| Calm / Normal | `#155E42` | `#E3F5EC` | `0` (none) |
| Warning / Caution | `#844E0A` | `#FFF0D1` | `0` (none) |
| Danger / Critical | `#9E2A35` | `#FDEBEF` | `0` (none) |
| Pending / Neutral | `#466078` | `#E8F1FA` | `0` (none) |

### Data Visualization Palette

1. `--chart-1`: `#0868DC` (AEROSENSE Cobalt)
2. `--chart-2`: `#1F8A6B` (Sea Pine)
3. `--chart-3`: `#C97A16` (Warm Ochre)
4. `--chart-4`: `#C44536` (Terracotta)
5. `--chart-5`: `#4A6FA5` (Harbor Slate)

## 3. Typography

AEROSENSE uses a two-family pairing that combines geometric display warmth with high-legibility civic body text.

- **Display & Headings (`--font-display`)**: `Plus Jakarta Sans` (`600`, `700`, `800`) — tight tracking (`-0.025em`), balanced wrapping (`text-wrap: balance`), used for brand marks and `h1`–`h3`.
- **Body & Interface (`--font-sans`)**: `Public Sans` (`400`, `500`, `600`, `700`) — crisp, neutral legibility at all UI sizes, never `Inter`.
- **Numeric Data**: All sensor measurements, temperatures, timestamps, distances, and earthquake magnitudes must apply `font-variant-numeric: tabular-nums`.
- **Case Discipline**: Use natural sentence case for headings, status labels, and datelines. Avoid `text-transform: uppercase` on section eyebrows or status labels.

## 4. Layout Primitive

Every page repeats one architectural primitive: **the clean sky-bordered white panel with borderless tonal inner rows**.

- **Outer panels**: `#FFFFFF` background, `1px solid var(--aero-rim)` (`#CDDFF0`) border, `22px` radius (`--aero-panel-radius`), no raised shadows or blur. The sticky top bar can use a lightly frosted surface with an opaque fallback.
- **Illustrated hero frames**: `32px` radius (`--aero-hero-radius`) with time-matched 2D sky backdrops.
- **Inner cards & controls**: `16px` card radius (`--aero-card-radius`), `14px` control radius (`--aero-control-radius`).
- **Borderless tonal rows**: Items inside a panel (hazard lists, earthquake logs, weather alerts, status chips) use soft borderless tonal fills (`#F1F8FF`, `#EAF7F0`, `#FFF4DF`) without outer colored border outlines.

## 5. Artwork and Time of Day (WIB / `Asia/Jakarta`)

Use the original Pearl artwork for weather and environmental conditions, the original device illustration for sensor panels, and the Falcon poses for AERO-BOT. Weather artwork follows the forecast and the local time in WIB. Keep sky backgrounds quiet where text or data appears.

| Period | WIB | Sky | Text |
| --- | --- | --- | --- |
| Morning | 05.00–10.59 | Pale gold and blue | Maritime ink |
| Midday | 11.00–14.59 | Clear blue | Maritime ink |
| Afternoon | 15.00–17.59 | Warm horizon | Maritime ink |
| Night | 18.00–04.59 | Deep blue | Light mist |

Show one sun or moon per composition. If the foreground artwork already has one, use a sky without a second one.

AERO-BOT uses its existing poses for each expression. Idle motion is subtle. The greeting briefly uses the original welcome pose. The mood card shows the sensor location and time alongside the expression and practical advice. An old or invalid reading gets a neutral expression.

## 6. Uniform Icon System

- **Library**: `lucide-react` exclusively for all interface icons (plus matching custom map glyphs in `MapSymbol`).
- **Stroke geometry**: Uniform `stroke-width: 1.75`, `stroke-linecap: round`, `stroke-linejoin: round` applied globally via CSS.
- **No decorative clutter**: Do not use emojis as UI icons, decorative sparkle clusters, or glowing/pulsing status dots.

## 7. Browser UI Theming & Accessibility

- Declare `color-scheme: light` and `accent-color: var(--aero-blue)` on `:root`.
- Style `::selection` with `#D7E8FC` background and `#102A47` ink for clear reading contrast.
- Keep scrollbars accessible: `scrollbar-color: #6B8FAE #EAF3FC` (>= 3:1 contrast) with `scrollbar-width: auto`.
- Use `:user-invalid` and `:user-valid` for native form validation feedback.
- Respect `prefers-reduced-motion: reduce` by disabling ambient float and pulse animations.

## 8. Explicit Visual Bans

1. No `Inter` font anywhere in CSS or HTML fallbacks.
2. No lavender, violet, or purple backgrounds, pills, gradients, or chart colors.
3. No colored boxes with darker colored `1px` outer border outlines on badges, tags, or alerts.
4. No duplicate moons or cropped moons in night sky headers.
5. Keep dialogs, cards, and reading surfaces opaque. Reserve blur for the sticky top bar.
6. No glowing status dots, pulsing badges, or floating eyebrow pills above headings.
