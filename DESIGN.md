# AEROSENSE Design System

This document defines the visual language, typography, color system, 2D artwork schedule, icon rules, and structural conventions for the AEROSENSE web platform. All new views and updates must follow these specifications so the interface stays cohesive, calm, and legible.

## 1. Visual Direction

**Aesthetic**: Coastal Atmospheric Almanac — warm editorial clarity paired with handcrafted 2D environmental artwork.

AEROSENSE is a public and operational environmental observatory for Indonesian communities and industrial areas. The interface should feel approachable, grounded, and trustworthy: like a modern printed weather almanac brought to life with clear 2D illustrations, rather than a generic dark-mode dashboard or heavily decorated SaaS template.

## 2. Color System

The palette uses warm paper-mist grounds, deep maritime slate ink, and a single disciplined coastal cobalt accent. **Lavender, violet, and purple hues are strictly forbidden across all surfaces, badges, illustrations, and charts.**

### Core Tokens

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Canvas ground | `--aero-canvas-soft` | `#F5F6F2` | Application background |
| Primary sheet | `--aero-surface` | `#FFFFFF` | Main content panels and data sheets |
| Secondary recess | `--aero-surface-tint` | `#EDF2EE` | Subtle recessed strips, table headers, quiet controls |
| Structural hairline | `--aero-rim` | `#D7E0DA` | `1px` borders and horizontal list dividers |
| Primary ink | `--aero-ink` | `#102436` | Headings, primary data values, active copy (~14.5:1 on white) |
| Secondary ink | `--aero-muted` | `#3F566A` | Descriptions, metadata, timestamps (~7.2:1 on white, WCAG AA+) |
| Primary accent | `--aero-blue` | `#0A58CA` | Primary actions, links, active navigation state |
| Primary accent hover | `--aero-blue-hover` | `#0847A6` | Hover and active feedback for primary actions |
| Accent tint | `--aero-blue-soft` | `#E8F1FC` | Active sidebar item and selected option surface |

### Semantic Status Colors

Status colors communicate verified sensor thresholds or meteorological warnings only—never decoration.

| Tone | Foreground | Background | Border |
| :--- | :--- | :--- | :--- |
| Calm / Normal | `#166547` | `#EAF6F0` | `#C7E6D7` |
| Warning / Caution | `#7C4406` | `#FDF6E8` | `#EBD3A7` |
| Danger / Critical | `#98222F` | `#FCEEEF` | `#EFC4CA` |
| Pending / Neutral | `#384F63` | `#F2F5F7` | `#D3DDE4` |

### Data Visualization Palette

1. `--chart-1`: `#0A58CA` (Coastal Cobalt)
2. `--chart-2`: `#1F8A6B` (Sea Pine)
3. `--chart-3`: `#C97A16` (Warm Ochre)
4. `--chart-4`: `#C44536` (Terracotta)
5. `--chart-5`: `#4A6FA5` (Harbor Slate)

## 3. Typography

AEROSENSE uses a two-family pairing that combines geometric display warmth with high-legibility civic body text.

- **Display & Headings (`--font-display`)**: `Plus Jakarta Sans` (`600`, `700`, `800`) — tight tracking (`-0.025em`), balanced wrapping (`text-wrap: balance`), used for brand marks and `h1`–`h3`.
- **Body & Interface (`--font-sans`)**: `Public Sans` (`400`, `500`, `600`, `700`) — crisp, neutral legibility at all UI sizes, never `Inter`.
- **Numeric Data**: All sensor measurements, temperatures, timestamps, distances, and earthquake magnitudes must apply `font-variant-numeric: tabular-nums`.
- **Case Discipline**: Use natural sentence case for headings, status labels, and eyebrows. Avoid `text-transform: uppercase` on section eyebrows or status labels.

## 4. Layout Primitive

Every page repeats one architectural primitive: **the flat bordered sheet**.

- **Outer sheets**: `#FFFFFF` background, `1px solid var(--aero-rim)` border, `16px` radius (`--aero-panel-radius`), zero drop shadows, zero frosted-glass blur.
- **Illustrated hero frames**: `20px` radius (`--aero-hero-radius`) with time-matched 2D sky backdrops.
- **Inner tiles & controls**: `10px`–`12px` radius (`--aero-card-radius`, `--aero-control-radius`).
- **Ruled rows, not nested cards**: Lists inside a sheet (hazard lists, earthquake logs, rain schedules, threshold readouts) use `1px solid var(--aero-rim)` horizontal dividers and clean typographic alignment instead of placing rounded pastel boxes inside rounded cards.

## 5. Time-of-Day 2D Artwork System (WIB / `Asia/Jakarta`)

All weather scenes (`public/assets/environment/pearl/*.webp`) and illustrated sky backdrops (`src/assets/images/skyline*.svg`) must correspond accurately to local Indonesian Western Time (`Asia/Jakarta`):

| Period | WIB Hours | Sky Backdrop | Clear / Fair Scene | Text Polarity |
| :--- | :--- | :--- | :--- | :--- |
| Morning (`morning`) | `05:00 – 10:59` | `skyline-morning.svg` (soft dawn peach-sky) | `sunny-morning.webp` | Dark maritime ink (`#102436`) |
| Midday (`day`) | `11:00 – 14:59` | `skyline-sun.svg` / `skyline.svg` (clear coastal sky) | `sunny.webp`, `partly-cloudy.webp` | Dark maritime ink (`#102436`) |
| Afternoon (`afternoon`) | `15:00 – 17:59` | `skyline-afternoon.svg` (warm amber-dusk horizon) | `sunny-dusk.webp` | Dark maritime ink (`#102436`) |
| Night (`night`) | `18:00 – 04:59` | `skyline-night.svg` (deep maritime twilight + crescent moon) | `sunny-night.webp`, `warm-night.webp`, `*-night.webp` | Light mist ink (`#F4F8FB`) |

Precipitation and fog scenes (`storm`, `steady-rain`, `light-rain`, `drizzle`, `fog`, `cloudy`) always switch to their `*-night` asset during `night` hours (`18:00–04:59 WIB`) or whenever forecast data marks `is_day === false`. Temperature labels such as `"Cuaca terasa hangat"` must never override morning or midday scenes with dusk artwork.

2D mascot illustrations (`public/assets/aerobot/falcon/*.webp`) are framed against the coastal sage-mist sky (`aerobot-sky.svg`) and appear in assistant cards, onboarding, and friendly empty states.

## 6. Uniform Icon System

- **Library**: `lucide-react` exclusively for all interface icons (plus matching custom map glyphs in `MapSymbol`).
- **Stroke geometry**: Uniform `stroke-width: 1.75`, `stroke-linecap: round`, `stroke-linejoin: round` applied globally via CSS. Do not pass ad-hoc `strokeWidth` overrides on individual Lucide icons.
- **Optical sizes**: `14px` inline status tags, `16px` links and metadata, `18px` navigation and list rows, `20px` standalone icon buttons.
- **No decorative clutter**: Do not use emojis as UI icons, decorative sparkle clusters, or glowing/pulsing status dots.

## 7. Browser UI Theming & Accessibility

- Declare `color-scheme: light` and `accent-color: var(--aero-blue)` on `:root`.
- Style `::selection` with `#D7E8FC` background and `#102436` ink for clear reading contrast.
- Keep scrollbars accessible: `scrollbar-color: #5C7388 #EDF1EE` (>= 3:1 contrast) with `scrollbar-width: auto` so mouse and touch users retain full hit targets.
- Use `:user-invalid` and `:user-valid` for native form validation feedback so fields are not marked invalid before user interaction.
- Maintain >= 4.5:1 contrast for body copy and >= 3:1 for large headings and UI controls. Never place `user-select: none` on readable content text.
- Respect `prefers-reduced-motion: reduce` by disabling ambient float and pulse animations.

## 8. Explicit Visual Bans

1. No `Inter` font anywhere in CSS or HTML fallbacks.
2. No lavender, violet, or purple backgrounds, pills, gradients, or chart colors.
3. No `backdrop-filter: blur(...)` glassmorphism on navigation bars, dialogs, or cards.
4. No colored left/top accent stripes on cards.
5. No nested rounded pastel cards inside rounded containers.
6. No glowing status dots, pulsing badges, or floating eyebrow pills above headings.
7. No low-contrast light-gray copy on white backgrounds.
8. No generic numbered `1, 2, 3` circle step sequences or decorative sparkle icons.
