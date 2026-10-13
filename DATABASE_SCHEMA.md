# Skema Database AEROSENSE (Supabase / PostgreSQL)

Dokumen ini mendeskripsikan usulan struktur tabel *database* relasional untuk proyek AEROSENSE. Skema ini dirancang untuk memisahkan data operasional (relasional) dengan aliran data sensor (time-series) guna menjaga performa sistem.

---

## 1. Tabel Master (Entitas Utama)

### `users`
Tabel profil pengguna (terhubung dengan Supabase Auth).
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `role` (Enum: `admin`, `operator`, `viewer`)
- `status` (Enum: `active`, `inactive`)
- `created_at` (Timestamptz)

### `nodes`
Menyimpan identitas dan metadata lokasi perangkat sensor (ESP32-S3).
- `id` (String/UUID, Primary Key) - *Contoh: "NODE_01"*
- `name` (String) - *Contoh: "Node Pabrik 01"*
- `mac_address` (String, Unique)
- `latitude` (Float)
- `longitude` (Float)
- `status` (Enum: `online`, `offline`, `maintenance`)
- `firmware_version` (String)
- `created_at` (Timestamptz)

---

## 2. Tabel Time-Series (Data Sensor)

### `sensor_readings`
Menyimpan data hasil inferensi Edge AI (Raspberry Pi) yang masuk secara periodik. 
*(Catatan: Sangat disarankan untuk mengaktifkan partisi per bulan atau menggunakan ekstensi TimescaleDB di PostgreSQL untuk tabel ini).*
- `id` (BigInt/UUID, Primary Key)
- `timestamp` (Timestamptz, Indexed) - *Waktu perekaman data*
- `node_id` (String, FK ke `nodes.id`, Indexed)
- `suhu` (Float) - *Suhu mentah dari sensor*
- `kelembapan` (Float) - *Kelembapan mentah dari sensor*
- `pm25_raw` (Float)
- `eco2_raw` (Float)
- `tvoc_raw` (Float)
- `pm25_clean` (Float) - *Estimasi bersih dari model GRU*
- `eco2_clean` (Float) - *Estimasi bersih dari model GRU*
- `tvoc_clean` (Float) - *Estimasi bersih dari model GRU*
- `aqi_calculated` (Integer) - *(Opsional) Hasil kalkulasi AQI di server*

---

## 3. Tabel Peringatan & Pengaturan (Alerts & Settings)

### `alerts`
Menyimpan riwayat anomali atau batas (*threshold*) yang terlampaui.
- `id` (UUID, Primary Key)
- `node_id` (String, FK ke `nodes.id`)
- `alert_type` (Enum: `warning`, `critical`, `hardware_issue`)
- `parameter` (String) - *Contoh: "pm25"*
- `value_at_alert` (Float)
- `message` (Text) - *Contoh: "PM2.5 melebihi ambang batas (75)"*
- `is_resolved` (Boolean) - *Status penanganan masalah*
- `timestamp` (Timestamptz)

### `system_thresholds`
Menyimpan konfigurasi batas aman polusi, dikelola oleh Admin di menu Settings.
- `id` (Integer, Primary Key)
- `parameter` (String, Unique) - *Contoh: "pm25", "tvoc"*
- `warning_level` (Float)
- `critical_level` (Float)
- `updated_by` (UUID, FK ke `users.id`)

---

## 4. Tabel Pelaporan (Laporan ESG)

### `esg_activity_data`
Menyimpan data manual (atau tarikan API pihak ketiga) terkait operasional pabrik yang dibutuhkan untuk menghitung laporan ESG/Jejak Karbon aktual.
- `id` (UUID, Primary Key)
- `period_month` (Date/String) - *Contoh: "2026-08"*
- `electricity_kwh` (Float) - *Konsumsi listrik pabrik*
- `fuel_liters` (Float) - *Konsumsi bahan bakar fosil*
- `total_carbon_tons` (Float) - *Jejak karbon (dihitung berdasarkan faktor emisi)*
- `created_by` (UUID, FK ke `users.id`)
- `created_at` (Timestamptz)
