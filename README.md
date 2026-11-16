# AEROSENSE Dashboard

Platform web dan layanan backend untuk pemantauan kualitas udara dan kondisi lingkungan di sekitar kawasan industri. Sistem memisahkan pembacaan langsung dari node sensor, hasil analisis model GRU, data kondisi wilayah, serta asisten **AERO-BOT**.

## Fitur Utama

- **Dashboard & Hub Lingkungan**: Ringkasan kondisi sensor aktif, cuaca, kualitas udara, tanah, titik panas, sungai, dan gempa untuk titik lokasi yang dipilih, lengkap dengan kabar bencana Indonesia (ANTARA dan GDACS).
- **Peta Sensor**: Visualisasi koordinat asli setiap node beserta layer informasi wilayah.
- **Riwayat & Model**: Pembacaan terbaru, historis input sensor, hasil prediksi GRU, serta ekspor data JSON/CSV.
- **Perangkat Sensor & Aktuator**: Manajemen node, status koneksi, aturan ambang batas operator, serta kendali aktuator WATERSENSE melalui MQTT.
- **AERO-BOT & Layar Robot**: Asisten chat melalui backend dan n8n, serta tampilan layar robot (`/robot-screen`) dengan dukungan suara.
- **Laporan & Akses Berbasis Lokasi**: Autentikasi Supabase, pengelolaan kawasan dan peran pengguna, peringatan operator, integrasi WhatsApp (GoWA), serta laporan lingkungan (`/esg-reports`).

## Alur Sistem

```text
ESP32 / LoRa → gateway → API → Supabase
                                   ↓
                      event job → n8n → Gemini
                                   ↓
Web / layar robot ← API ← hasil di Supabase

API publik → n8n Hub lingkungan → cache Supabase → API → web & konteks AERO-BOT
```

## Struktur Proyek

- `src/` — Frontend React, TypeScript, Vite, Tailwind CSS, dan aset UI.
- `server/` — Backend API Node.js (`aerosense-api`), skema SQL Supabase (`server/supabase`), dan layanan TTS (`server/tts`).
- `deploy/` — Konfigurasi Nginx (`deploy/nginx.conf`) dan broker MQTT Mosquitto (`deploy/mqtt`).
- `firmware/` — Firmware node sensor, mist sprinkler, dan WATERSENSE MQTT.
- `gateway/` — Layanan penerima LoRa gateway (`lora_receiver.py`).
- `n8n/` — Script dan workflow automasi n8n.
- `robot-display/` — Utilitas tampilan dan suara robot.
- `scripts/` — Script bantu build workflow dan deployment.

## Menjalankan Lokal

Gunakan **Node.js 22** dan **pnpm**.

```bash
pnpm install --frozen-lockfile
cd server && npm ci && cd ..
cp server/.env.example server/.env
```

Isi credential backend di `server/.env`, lalu jalankan dari dua terminal:

```bash
cd server
node --env-file=.env api/server.mjs
```

```bash
pnpm dev --host 127.0.0.1
```

Vite meneruskan `/api` ke `http://127.0.0.1:8080`. Browser mengambil URL Supabase dan publishable key dari konfigurasi publik backend, sementara `service-role key`, credential perangkat, dan `internal key` tetap berada di server.

Untuk menjalankan tampilan demo lokal tanpa backend produksi:

```bash
pnpm demo:build
pnpm demo:serve
```

## Pemeriksaan

```bash
pnpm test
pnpm lint
pnpm build
```

## Deploy

Panduan lengkap deployment tersedia di [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

- Backend menggunakan `server/compose.yaml` (`aerosense-api:8080`).
- Frontend web menggunakan `compose.yaml` di root dan reverse proxy Nginx di `deploy/nginx.conf`.
- Keduanya terhubung dalam Docker network `n8n_default`.
- Container `web` melayani aplikasi pada `127.0.0.1:8082` dengan endpoint internal (`/api/internal/`) ditutup pada proxy publik.
