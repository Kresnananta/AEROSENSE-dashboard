# AEROSENSE Dashboard

> Air Quality Monitoring Dashboard — Real-time sensor data visualization and management.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (New York style) |
| Routing | [React Router v7](https://reactrouter.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Linter | [Oxlint](https://oxc.rs/) |
| Package Manager | [pnpm](https://pnpm.io/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Kresnananta/AEROSENSE-dashboard.git
cd aerosense-web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run Oxlint |

## Project Structure

```
aerosense-web/
├── public/                         # Static public assets
├── src/
│   ├── assets/                     # Static assets bundled by Vite
│   │   ├── images/                 # Image files (PNG, JPG, SVG)
│   │   └── icons/                  # Icon files
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   ├── layout/                 # App shell & layout components
│   │   │   ├── DashboardLayout.tsx # Main shell (sidebar + header + content)
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   └── Header.tsx          # Top header bar
│   │   ├── charts/                 # Chart & data visualization components
│   │   ├── data-table/             # Table components with sorting/filtering
│   │   └── shared/                 # Common reusable components
│   │       ├── Logo.tsx            # Brand logo
│   │       ├── ThemeToggle.tsx     # Dark/light mode switch
│   │       ├── LoadingSpinner.tsx  # Loading indicator
│   │       ├── ErrorBoundary.tsx   # Error catcher with retry
│   │       └── EmptyState.tsx      # Empty data placeholder
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx   # Main overview with KPI cards
│   │   ├── analytics/
│   │   │   └── AnalyticsPage.tsx   # Data analysis & trends
│   │   ├── sensors/
│   │   │   ├── SensorsPage.tsx     # Sensor list & management
│   │   │   └── SensorDetailPage.tsx# Individual sensor data
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx    # User & app settings
│   │   └── not-found/
│   │       └── NotFoundPage.tsx    # 404 page
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication state & actions
│   │   ├── useTheme.ts             # Theme (dark/light) management
│   │   └── useMediaQuery.ts        # Responsive breakpoint detection
│   │
│   ├── services/                   # API layer & external integrations
│   │   ├── api.ts                  # Base HTTP client (fetch wrapper)
│   │   ├── auth.service.ts         # Auth API calls (login, register)
│   │   └── sensor.service.ts       # Sensor CRUD API calls
│   │
│   ├── store/                      # Global state management (Zustand-ready)
│   │   ├── auth.store.ts           # Auth state (user, tokens)
│   │   └── theme.store.ts          # Theme preferences
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── auth.types.ts           # User, LoginCredentials, AuthResponse
│   │   ├── sensor.types.ts         # Sensor, SensorReading, AirQualityLevel
│   │   └── api.types.ts            # ApiResponse, PaginatedResponse, ApiError
│   │
│   ├── lib/                        # Utility functions & helpers
│   │   ├── utils.ts                # cn() class name merger (shadcn utility)
│   │   └── constants.ts            # Routes, nav items, app config, API config
│   │
│   ├── config/                     # App-level configuration
│   │   └── routes.tsx              # Centralized route definitions
│   │
│   ├── styles/                     # Global styles & design tokens
│   │   └── globals.css             # Tailwind imports + shadcn CSS variables
│   │
│   ├── App.tsx                     # Root component (ErrorBoundary + Router)
│   ├── main.tsx                    # Entry point
│   └── vite-env.d.ts               # Vite type declarations
│
├── components.json                 # shadcn/ui configuration
├── tsconfig.json                   # TypeScript root config
├── tsconfig.app.json               # App TypeScript config (strict mode)
├── tsconfig.node.json              # Node TypeScript config (vite.config.ts)
├── vite.config.ts                  # Vite config with @ path alias
└── package.json
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                      App.tsx                        │
│                   (ErrorBoundary)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │               AppRouter                       │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Auth Pages (no layout)                 │  │  │
│  │  │  /login  →  LoginPage                   │  │  │
│  │  │  /register  →  RegisterPage             │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  DashboardLayout                        │  │  │
│  │  │  ┌──────────┬──────────────────────┐    │  │  │
│  │  │  │ Sidebar  │  Header              │    │  │  │
│  │  │  │          ├──────────────────────┤    │  │  │
│  │  │  │  Nav     │  <Outlet />          │    │  │  │
│  │  │  │  Links   │  /dashboard          │    │  │  │
│  │  │  │          │  /analytics          │    │  │  │
│  │  │  │          │  /sensors            │    │  │  │
│  │  │  │          │  /sensors/:id        │    │  │  │
│  │  │  │          │  /settings           │    │  │  │
│  │  │  └──────────┴──────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

#### Path Aliases

Import menggunakan `@/` alias yang di-resolve ke `src/`. Ini menghindari relative path yang panjang dan membuat import lebih bersih:

```tsx
// ✅ Clean
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

// ❌ Avoid
import { cn } from '../../../lib/utils'
```

#### Component Organization

Components dibagi menjadi 5 kategori:

| Folder | Fungsi | Contoh |
|--------|--------|--------|
| `ui/` | Primitif shadcn/ui (auto-generated) | Button, Card, Input |
| `layout/` | Struktur halaman & navigasi | Sidebar, Header, DashboardLayout |
| `charts/` | Komponen visualisasi data | AreaChart, BarChart, LineChart |
| `data-table/` | Tabel data dengan fitur lengkap | DataTable, Pagination, Toolbar |
| `shared/` | Komponen umum yang reusable | Logo, ThemeToggle, LoadingSpinner |

#### Separation of Concerns

```
Pages       → Apa yang user lihat (komposisi komponen + layout)
Components  → Bagaimana sesuatu terlihat (UI reusable)
Hooks       → Logika React yang reusable (state, effects)
Services    → Komunikasi dengan API/backend
Store       → State global yang di-share antar komponen
Types       → Kontrak data (TypeScript interfaces)
Lib         → Fungsi utility murni (tanpa React)
Config      → Konfigurasi aplikasi (routes, settings)
```

## Adding shadcn/ui Components

shadcn/ui sudah dikonfigurasi. Tambah komponen via CLI:

```bash
# Tambah komponen individual
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add table

# Atau tambah beberapa sekaligus
npx shadcn@latest add button card input table dialog
```

Komponen akan otomatis di-generate ke `src/components/ui/`.

## Environment Variables

Buat file `.env.local` di root project:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Akses di kode melalui `import.meta.env.VITE_API_BASE_URL` atau via `API_CONFIG` constant di `src/lib/constants.ts`.

## License

Private — All rights reserved.
