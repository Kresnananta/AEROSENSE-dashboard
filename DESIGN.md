# AEROSENSE Design System

This document defines the visual language, typography, color system, 2D artwork schedule, icon rules, and structural conventions for the AEROSENSE web platform. All new views and updates must follow these specifications so the interface stays cohesive, calm, and legible.

## 1. Visual Direction

**Aesthetic**: Coastal Atmospheric Observatory — airy sky-blue clarity paired with handcrafted 2D environmental artwork.

AEROSENSE is a public and operational environmental observatory for Indonesian communities and industrial areas. The interface should feel approachable, unified, and trustworthy: clean sky-blue atmospheric surfaces, crisp white data sheets, and time-aware 2D illustrations without generic dark-mode clichés or mismatched styling across sections.

## 2. Color System

The palette uses AEROSENSE's signature airy sky-blue canvas, crisp white data sheets, deep maritime ink, and cobalt for navigation. Saturated gold lifts the main action within a page or section. **Lavender, violet, and purple hues are strictly forbidden across all surfaces, badges, illustrations, and charts.**

### Core Tokens

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Canvas ground | `--aero-canvas-soft` | `#EAF5FF` | Application background |
| Base background | `--background` | `#F3F8FF` | Document background |
| Primary sheet | `--aero-surface` | `#FFFFFF` | Main content panels and data sheets |
| Sidebar surface | `--sidebar` | `#F8FCFF` | Navigation sidebar |
| Structural hairline | `--aero-rim` | `#CDDFF0` | `1px` panel borders |
| Primary ink | `--aero-ink` | `oklch(30% .089 251)` | Body text and primary data |
| Heading blue | `--aero-heading` | `oklch(39% .133 253)` | Page titles, section headings, and forecast values |
| Secondary ink | `--aero-muted` | `oklch(43% .077 246)` | Descriptions, metadata, and timestamps |
| Primary accent | `--aero-blue` | `#0868DC` | Primary actions, links, active navigation state |
| Featured action | `--aero-focus-gold` | `oklch(86% .172 87)` | Main landing, sensor detail, forecast, account and chat actions with dark ink |
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

Amber menandai prakiraan cuaca dan status Waspada. Merah lembut menandai akses ke peringatan sensor dan status Bahaya. Status selalu memuat label teks. Gunakan `--aero-amber-ink`, `--aero-amber-soft`, `--aero-red-ink`, dan `--aero-red-soft` sebagai pasangan warna.

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

Pages share a blue canvas, translucent panel edges, and solid reading areas when information is dense.

- **Outer panels**: Light blue gradient sheets with an alpha border and the shared panel radius. Tables, charts, and semantic data colors retain a stable reading surface.
- **Frosted surfaces**: Dashboard navigation, account forms, menus, and map overlays use layered blue tints and bounded blur. On the landing page, desktop links sit directly on the sky and the sign-in button uses a white pill. Reduced transparency and high contrast preferences use opaque surfaces.
- **Illustrated hero frames**: `32px` radius (`--aero-hero-radius`) with time-matched 2D sky backdrops.
- **Inner cards & controls**: `16px` card radius (`--aero-card-radius`), `14px` control radius (`--aero-control-radius`).
- **Borderless tonal rows**: Items inside a panel (hazard lists, earthquake logs, weather alerts, status chips) use soft borderless tonal fills (`#F1F8FF`, `#EAF7F0`, `#FFF4DF`) without outer colored border outlines.

## 5. Artwork and Time of Day (WIB / `Asia/Jakarta`)

Use the original Pearl artwork for weather and environmental conditions, the original device illustration for sensor panels, and the Falcon poses for AERO-BOT. Weather artwork follows the forecast and the local time in WIB. Keep sky backgrounds quiet where text or data appears.

Reuse the sunless sky along the landing and forecast panel edges. Use the terrain contours around map filters and regional summaries.

| Period | WIB | Sky | Text |
| --- | --- | --- | --- |
| Morning | 05.00–10.59 | Pale gold and blue | Maritime ink |
| Midday | 11.00–14.59 | Clear blue | Maritime ink |
| Afternoon | 15.00–17.59 | Warm horizon | Maritime ink |
| Night | 18.00–04.59 | Deep blue | Light mist |

Show one sun or moon per composition. If the foreground artwork already has one, use a sky without a second one.

AERO-BOT uses its existing poses for each expression. Idle motion is subtle. The greeting animates the hand and accent marks in the original welcome pose, then returns to the current expression. The speech bubble conveys the mascot’s expression without implying a sensor result when data is unavailable. The mood card shows the sensor location and time alongside the expression and practical advice. An old or invalid reading gets a cheerful fallback with an explicit unknown air-quality status.

## 6. Uniform Icon System

- **Icon set**: AEROSENSE interface icons use a shared 24 × 24 grid. Weather and hazard icons carry the same shapes on the Hub, news cards, and map legend.
- **Stroke geometry**: Controls and map glyphs use round caps and joins with a 1.75 stroke. Primary and selected controls use a 2 stroke. The official AEROSENSE mark and wordmark typography carry the brand across the header, sidebar, and account pages.
- **No decorative clutter**: Do not use emojis as UI icons, decorative sparkle clusters, or glowing/pulsing status dots.

## 7. Browser UI Theming & Accessibility

- Declare `color-scheme: light` and `accent-color: var(--aero-blue)` on `:root`.
- Style `::selection` with `#D7E8FC` background and `#102A47` ink for clear reading contrast.
- Use the shared blue scrollbar colors and a rounded thumb where supported. Preserve default scrollbars for touch-only and high-contrast settings.
- Use `:user-invalid` and `:user-valid` for native form validation feedback.
- Respect `prefers-reduced-motion: reduce` by disabling ambient float and pulse animations.

## 8. Explicit Visual Bans

1. No `Inter` font anywhere in CSS or HTML fallbacks.
2. No lavender, violet, or purple backgrounds, pills, gradients, or chart colors.
3. No colored boxes with darker colored `1px` outer border outlines on badges, tags, or alerts.
4. No duplicate moons or cropped moons in night sky headers.
5. Keep dense readings and semantic colors legible. Use higher opacity behind dialog text and map readouts.
6. No glowing status dots, pulsing badges, or floating eyebrow pills above headings.
