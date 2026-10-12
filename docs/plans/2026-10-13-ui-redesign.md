# UI Redesign AEROSENSE — Implementation Plan (Revisi Terverifikasi)

**Goal:** Memindahkan prototipe `reference-ui/dist` (vanilla HTML/CSS/JS) ke aplikasi React 19 + TS + Tailwind v4 yang sudah ada, tanpa merusak routing, tipe data, dan peta Leaflet yang sudah berjalan.

**Branch:** `feat/UI-prettier` · **Sumber desain:** `reference-ui/dist/{index.html, styles.css, dashboard-refinement.css, app.js}`

---

## 1. Hasil Verifikasi Plan Lama

Plan versi pertama (`docs/plans/2026-10-13-ui-redesign.md`) sudah benar arahnya, tapi ada beberapa hal yang tidak cocok dengan codebase:

| # | Masalah di plan lama | Kondisi codebase | Koreksi |
|---|---|---|---|
| 1 | Tidak membahas halaman yang **tidak ada** di prototipe | Ada `/nodes`, `/nodes/:id`, `/system`, `/login`, `/register` | Lihat **Keputusan A** |
| 2 | Peta diganti peta SVG ilustratif | `MapContainer.tsx` & `MiniMap.tsx` pakai **Leaflet** + OSM berfilter (gaya yang Anda pilih) | Lihat **Keputusan B** |
| 3 | Bikin SVG sprite `IconLibrary` baru | Proyek sudah pakai `lucide-react` | Pakai lucide, tanpa sprite |
| 4 | Grafik dari `<polyline>` statis | Sudah ada `recharts` + `ui/chart.tsx` | Pakai recharts |
| 5 | Data node di-hardcode per komponen (`pm:'12,1'` string) | Ada `types/node.types.ts` + `lib/mock-data.ts` | Semua data lewat `mock-data.ts` + tipe yang ada |
| 6 | Langkah TDD (tulis test dulu) | **Tidak ada test runner** di `package.json` | Verifikasi = `pnpm build` + `pnpm lint` + cek di browser |
| 7 | Font Inter tidak disebut | Belum dimuat di `index.html` | Tambahkan di Task 1 |
| 8 | Komponen lama tidak disinggung | `AirQualityGauge`, `RealtimeMetrics`, `NodeSummary`, `TrendChart`, `analytics/*` | Dihapus setelah halaman pengganti selesai (Task 9) |

> [!NOTE]
> Yang sudah dikerjakan di langkah sebelumnya: `reference-ui/` disalin ke workspace (dan dimasukkan ke `.gitignore`), dan `aerobot.svg` + `aerosense-logo.svg` sudah ada di `public/assets/`.

---

## 2. Keputusan yang Disetujui

**A. Halaman yang tidak ada di prototipe:**
- `/nodes` & `/nodes/:id` (Monitoring Node) → **tetap dipertahankan**, diberi styling baru, masuk sidebar sebagai item ke-7 "Monitoring node".
- `/system` (Pengaturan) → **dipertahankan**, dipindah ke menu profil di bagian bawah sidebar (ikon ⋯).
- `/login`, `/register` → **di-restyle ringan** dengan logo + palet baru (di luar shell).

**B. Peta:** **tetap pakai Leaflet** (koordinat asli, gaya grayscale yang Anda suka), lalu marker dan legenda diberi gaya prototipe (titik bulat bertepi putih, legenda Baik/Sedang/Perlu perhatian). Peta SVG ilustratif prototipe tidak dipakai, karena peta itu sendiri ditulis *"bukan koordinat sebenarnya"*.

**C. Nama & data contoh:** node baru (Cerme, Manyar, Sidayu, …, 10 node di Gresik) akan **menggantikan** `Node #01–#04` di `mock-data.ts`, dengan koordinat perkiraan per kecamatan.

---

## 3. Strategi Styling

- Token warna/radius/shadow prototipe → blok `@theme` di `globals.css` (`--color-brand: #086cfb`, `--color-ink: #132443`, `--color-muted: #74849d`, `--color-line: #e5eef8`, `--color-pale: #eaf4ff`, `--color-app: #f3f8ff`, `--shadow-soft`).
- Layout & komponen ditulis dengan **utility Tailwind**.
- Yang sulit di-Tailwind-kan (keyframes `appear`, `aqi-float`, `sparkle`, `mascot-hello`, `mascot-breathe`, ring `conic-gradient`, latar hero) → file baru `src/styles/aerosense.css`, di-import dari `globals.css`. Termasuk `prefers-reduced-motion`.
- Ikon (pemetaan sprite → lucide): `grid→LayoutGrid`, `map→Map`, `chart→LineChart`, `file→FileText`, `bell→Bell`, `chat→MessageCircle`, `wind→Wind`, `thermo→Thermometer`, `check→Check`, `spark→Sparkles`, `download→Download`, `menu→Menu`, `close→X`, `chevron→ChevronRight`.

---

## 4. Tugas

Setiap task diakhiri: `pnpm build` (tsc + vite) lolos → `pnpm lint` → cek di browser → commit.

### Task 1 — Fondasi
- **Modify** `index.html`: font Inter (400–900), `<title>`, meta description, favicon.
- **Modify** `src/styles/globals.css`: token `@theme` baru; `--background`/`--primary` shadcn diarahkan ke palet baru agar komponen `ui/*` ikut berubah.
- **Create** `src/styles/aerosense.css`: keyframes + kelas khusus (hero, ring AQI, maskot).
- **Modify** `src/lib/constants.ts`: tambah `ROUTES.AEROBOT = '/aerobot'`; `NAV_ITEMS` baru (label Indonesia, ikon lucide, `badge?`).
- **Modify** `src/lib/mock-data.ts` + `src/types/node.types.ts`: 10 node Gresik; helper `getAqiLevel(aqi)` → `'good' | 'moderate' | 'warning'` beserta label & warna.
- Commit: `feat(ui): design tokens, fonts, and sample data for redesign`

### Task 2 — App Shell
- **Rewrite** `components/layout/Sidebar.tsx`: logo (`/assets/aerosense-logo.svg`), workspace picker, nav + badge (Peringatan `2`, AERO-BOT `BARU`), kartu bantuan, profil (menu ke `/system`).
- **Create** `components/layout/Topbar.tsx`: hamburger mobile, breadcrumb dari `useLocation()` + `NAV_ITEMS`, badge `DATA CONTOH`, lonceng → `/alerts`, avatar.
- **Rewrite** `components/layout/DashboardLayout.tsx`: sidebar sticky; drawer di < 720px (tutup dengan Esc / klik luar / ganti rute); scroll ke atas tiap ganti rute.
- **Create** `components/shared/Toast.tsx` (`ToastProvider` + `useToast`), dipasang di `App.tsx`.
- **Create** `components/shared/PageHeading.tsx` (eyebrow, h1 dengan span biru, subjudul, chip `inline-demo`) — dipakai semua halaman.
- Commit: `feat(ui): new app shell, sidebar, topbar, toast`

### Task 3 — Beranda (`DashboardPage.tsx`)
- **Create** di `components/dashboard/`: `AqiHeroCard`, `OverviewMetrics`, `GreetingCard` (maskot + "Saran lain" mengacak 5 saran), `RecentAlertsCard`, `BotTeaser`.
- **Modify** `MiniMap.tsx`: gaya kartu & marker baru; klik marker → `/sensor-map?node=<id>`.
- Grid `1fr 284px`; di mobile urutan diatur ulang (hero → metrik → sapaan → peta → alert → teaser).
- Commit: `feat(ui): redesigned Beranda`

### Task 4 — Peta Sensor (`SensorMapPage.tsx`)
- **Create** `components/sensor-map/`: `NodeFilter` (segmented Semua/Baik/Perlu perhatian dengan jumlah), `NodeDetailCard`, `NodeTable`.
- **Modify** `map/MapContainer.tsx` + `map/NodeMarker.tsx`: terima `nodes`, `selectedId`, `onSelect`; marker bergaya prototipe.
- State node terpilih dibaca dari query `?node=` (default: Gresik Kota).
- Commit: `feat(ui): redesigned Peta Sensor`

### Task 5 — Analitik AI (`AnalyticsPage.tsx`)
- **Create** `components/analytics/`: `ModelStatTiles` (4 tile), `RawVsEstimateChart` (recharts, toggle 24 jam / 7 hari, `ReferenceLine` ambang batas), `MethodStepsCard`.
- Data 24 jam / 7 hari ditambahkan di `mock-data.ts`.
- Commit: `feat(ui): redesigned Analitik AI`

### Task 6 — Audit ESG (`ESGReportsPage.tsx`)
- **Create** `src/lib/export-utils.ts`: `downloadCsv` (dengan BOM), `downloadExcelXml`, `openPrintablePdf` (port dari `app.js`, isi di-escape).
- **Create** `components/esg/`: `AuditScoreCard`, `AuditMiniStat`, `ReportExportCard` (pakai `ui/select`), `AuditChecklistCard`, `EmissionLogTable` (pakai `ui/table`).
- Setiap ekspor memunculkan toast.
- Commit: `feat(ui): redesigned Audit ESG with exports`

### Task 7 — Peringatan (`AlertsPage.tsx`)
- **Create** `components/alerts/`: `FeaturedAlertCard`, `AlertDetailCard`, `GuidanceCard`, `ChannelCard`.
- Tombol "Tandai sudah dibaca" mengubah status di state halaman + toast. Jumlah badge sidebar diambil dari `mockAlerts` yang masih aktif.
- Commit: `feat(ui): redesigned Peringatan`

### Task 8 — Tanya AERO-BOT (baru)
- **Create** `src/lib/aerobot-replies.ts` (`replyFor`, port dari `app.js`).
- **Create** `pages/aerobot/AeroBotPage.tsx` + `components/aerobot/ChatPanel.tsx`, `ChatSide.tsx`.
- **Modify** `config/routes.tsx`: route `/aerobot`.
- Balasan berupa jawaban siap pakai dengan jeda 450 ms; Gemini belum dihubungkan (nanti lewat server, API key tidak boleh ada di browser).
- Commit: `feat(ui): Tanya AERO-BOT chat page`

### Task 9 — Halaman tersisa, pembersihan, QA
- Restyle `NodeMonitoringPage`, `NodeDetailPage`, `SystemPage`, `LoginPage`, `RegisterPage`, `NotFoundPage` dengan token baru (sesuai Keputusan A).
- Hapus komponen lama yang tidak dipakai lagi (cek dengan `grep` sebelum menghapus).
- Cek di lebar 1440 / 1024 / 768 / 390 px; navigasi keyboard & focus ring; reduced motion.
- `pnpm build` + `pnpm lint` bersih.
- Commit: `chore(ui): restyle remaining pages and remove legacy components`

---

## 5. Verifikasi

- **Otomatis:** `pnpm build` (sudah termasuk `tsc -b`) dan `pnpm lint` di akhir setiap task.
- **Manual (browser):** tiap halaman dibandingkan dengan `reference-ui/screenshots/*.svg`; cek interaksi: filter & pilih node, toggle grafik, 3 jenis ekspor, tandai alert, chat dan chip saran, drawer mobile.
