# Product Requirements Document (PRD)

# AEROSENSE Dashboard
### AIoT Continuous Emission Monitoring System
#### Versi Gemastik / Prototype Submission

Version : 1.1 (Gemastik Edition)
Status : Draft
Author : AEROSENSE Team

---

# 1. Overview

## 1.1 Background

AEROSENSE adalah platform AIoT (Artificial Intelligence of Things) untuk pemantauan kualitas udara secara real-time menggunakan jaringan multi-node sensor, dilengkapi kemampuan **AI Soft-Sensing** untuk mengestimasi parameter emisi yang tidak terukur langsung oleh sensor low-cost.

Dashboard ini digunakan oleh:

- Operator Lingkungan
- Auditor ESG
- Administrator Sistem
- Manajemen Kawasan Industri

Dashboard berfungsi sebagai pusat visualisasi, analisis, monitoring, pelaporan, dan administrasi sistem AEROSENSE.

## 1.2 Ruang Lingkup Prototype

Dokumen ini membedakan dua kategori kebutuhan:

- **Core Scope** — dibangun dan didemokan pada prototype.
- **Design Considerations** — aspek yang disadari penting secara arsitektural/regulasi, dituliskan sebagai wawasan desain, tidak diimplementasikan penuh pada tahap prototype ini.

Pemisahan ini dilakukan agar tim fokus mengembangkan diferensiasi utama (AI Soft-Sensing, monitoring real-time, pelaporan ESG dasar) tanpa mengorbankan waktu pengembangan untuk aspek produksi skala industri yang di luar cakupan kompetisi.

---

# 2. Objectives

Dashboard harus mampu:

- Menampilkan kondisi kualitas udara secara real-time.
- Memvisualisasikan persebaran sensor pada peta interaktif.
- Menampilkan histori data sensor.
- Menampilkan hasil AI Soft-Sensing (estimasi) beserta tingkat kepercayaannya.
- Menyediakan sistem alert.
- Mendukung pelaporan ESG dasar.
- Mengelola node sensor dan pengguna sesuai peran (role).

---

# 3. User Roles

## Administrator
- CRUD Node
- CRUD User
- Konfigurasi Sistem
- Melihat seluruh data

## Operator
- Monitoring
- Analytics
- Alerts
- ESG Report

## Auditor
- Dashboard
- Analytics
- ESG Report
- Export Report
- Tidak dapat mengubah konfigurasi sistem

---

# 4. Sidebar Navigation

- Dashboard
- Sensor Map
- Node Monitoring
- Analytics
- Alerts
- ESG Reports
- System

---

# 5. Dashboard

## Purpose
Memberikan ringkasan kondisi seluruh sistem dalam satu halaman.

## Components

### KPI Cards
- Total Nodes
- Active Nodes
- Offline Nodes
- Active Alerts
- Average AQI
- Estimated CO₂e
- Average AI Confidence

### Air Quality Summary
Status: Good / Moderate / Unhealthy / Hazardous

### Mini Map
Seluruh node dalam bentuk peta, marker berwarna Green/Yellow/Orange/Red.

### 24 Hour Trend
Chart: PM2.5, TVOC, eCO₂

### Recent Alerts
Table — Time, Node, Sensor, Severity

### Offline Nodes
Table — Node Name, Last Seen, Offline Duration

---

# 6. Sensor Map

## Purpose
Melihat persebaran sensor secara geografis.

## Components

### Interactive Map
Marker: Online / Offline / Warning / Critical

### Marker Popup
Node Name, PM2.5, TVOC, eCO₂, Temperature, Humidity, Last Update, Status

### Map Layer
Pilihan layer: PM2.5, TVOC, eCO₂, AQI, Heatmap

---

# 7. Node Monitoring

## Node List
Table — Node, Status, PM2.5, TVOC, eCO₂, Temperature, Humidity, Last Update

Klik salah satu node membuka halaman detail.

## Node Detail

### Sensor Overview
Cards: PM2.5, TVOC, eCO₂, Temperature, Humidity

### Historical Charts
Time Filter: 24 Hours / 7 Days / 30 Days / Custom
Charts: PM2.5, TVOC, eCO₂, Temperature, Humidity

### AI Estimation
Alur ditampilkan: **Raw Reading → Estimated Reading → Correction → Confidence**

Setiap titik data historis diberi penanda visual apakah nilai berasal dari **sensor asli** atau **hasil interpolasi/estimasi AI** — agar transparan tanpa perlu membangun sistem data-quality penuh.

### Node Health
MQTT Status, Latency, Last Seen, Uptime

---

# 8. Analytics

## Time-Series Analysis
Charts: PM2.5, TVOC, eCO₂, Temperature, Humidity

## Statistical Summary
Average, Minimum, Maximum, Median, Standard Deviation

## Comparison
Node vs Node, Date vs Date

## Correlation
Correlation Matrix antar PM2.5, TVOC, eCO₂, Temperature, Humidity

## AI Soft-Sensing

Bagian ini adalah **nilai jual utama** prototype — perlu diimplementasikan solid.

### Raw vs Estimated
Dual Line Chart

### Estimation Confidence
Gauge

### Average Correction
Card

### Model Information
Model Name, Version, Last Training Date

### Inference Statistics
Average Inference Time, Total Samples, Error Reduction

---

# 9. Alerts

## Alert Table
Columns: Timestamp, Node, Sensor, Severity, Description, Status

## Filters
Critical / Warning / Information

## Alert Detail
Sensor Value, Threshold, AI Explanation, Resolution Status

---

# 10. ESG Reports

## Carbon Summary
Cards: Estimated CO₂e, Average TVOC, Average PM2.5, Compliance Score

## Emission Log
Table: Date, Node, Estimated CO₂, TVOC, PM2.5

## Report Generator
Export: PDF, CSV, Excel

## Audit Trail (Simplified)
Tabel log perubahan sederhana: **siapa** mengubah, **apa** yang diubah, **kapan**. Cukup sebagai pencatatan dasar (basic activity log) untuk mendemokan konsep akuntabilitas data — bukan audit trail immutable tingkat produksi.

## Catatan Metodologi CO₂e
Estimasi CO₂e pada prototype ini menggunakan pendekatan konversi sederhana berbasis korelasi eCO₂/TVOC yang dilatih pada model GRU internal, sebagai **proxy demonstrasi konsep AI Soft-Sensing**. Metodologi ini belum divalidasi terhadap standar pelaporan emisi formal (lihat Bagian 12 — Design Considerations).

---

# 11. System

Administrator only.

## User Management
CRUD User, Role

## Node Management
CRUD Node, Location, Status

## Threshold Configuration
PM2.5, TVOC, AQI

## MQTT Configuration
Broker, Port, Connection Status

## API Configuration
Gemini API, Supabase, n8n

---

# 12. Design Considerations (Tidak Diimplementasikan di Prototype)

Bagian ini didokumentasikan untuk menunjukkan kesadaran arsitektural terhadap kebutuhan dunia nyata, tanpa dikerjakan pada tahap prototype/kompetisi.

## 12.1 Validitas Data untuk Audit ESG Formal
Sensor ambien (PM2.5/TVOC/eCO₂) bukan pengganti stack/flue gas analyzer. Untuk penggunaan produksi, konversi ke CO₂e idealnya mengacu ke kerangka seperti **IPCC Guidelines** atau **GHG Protocol**, dengan traceability penuh dari raw reading hingga angka pelaporan.

## 12.2 Kerangka Pelaporan ESG
Struktur laporan produksi sebaiknya mengacu ke standar seperti **GRI**, **PROPER (KLHK)**, atau **CSRD/ESRS** bila relevan dengan rantai pasok internasional, agar format Emission Log dan export kompatibel dengan kebutuhan audit eksternal.

## 12.3 Audit Trail Tingkat Produksi
Versi produksi idealnya memiliki log immutable, data lineage lengkap, versioning emission factor, dan tanda tangan digital untuk laporan yang telah diverifikasi.

## 12.4 Data Governance & Keamanan
Enkripsi in-transit/at-rest, retensi data jangka panjang (5–10 tahun untuk kebutuhan audit), data masking per-role, otentikasi broker MQTT (TLS), dan kontrol akses ketat terhadap API pihak ketiga.

## 12.5 Arsitektur Skala Produksi
Time-series store khusus (mis. TimescaleDB/InfluxDB) untuk telemetry volume tinggi, arsitektur multi-tenant untuk kawasan industri dengan banyak perusahaan, store-and-forward buffering untuk node dengan koneksi tidak stabil, serta proses provisioning/kalibrasi node baru.

## 12.6 Non-Functional Tingkat Produksi
SLA/uptime, backup & disaster recovery, kapasitas concurrent user dan jumlah node maksimum, serta kanal notifikasi tambahan (WhatsApp/SMS) di luar in-app/email.

---

# 13. Non Functional Requirements (Scope Prototype)

## Performance
- Initial Load < 3 Seconds
- Chart Render < 500 ms
- Realtime Refresh < 5 Seconds

## Responsive
Desktop dan Tablet (Mobile optional)

## Theme
Light Theme (tanpa opsi Dark Mode)

Gaya visual: modern SaaS, clean, rounded card, soft shadow, banyak whitespace — bukan gaya "industrial gelap".

- **Primary (Blue)** — sidebar active state, ring/gauge indikator utama (mis. AQI), search bar accent, ikon aktif
- **Background** — putih/abu sangat muda (light gray), card putih dengan border tipis
- **Status Aman/Good** — Green
- **Status Waspada/Warning** — Orange/Amber
- **Status Bahaya/Critical** — Red

Referensi visual: layout sidebar kiri fixed dengan item aktif berwarna biru solid, KPI card berbentuk rounded rectangle terpisah (bukan satu panel besar), badge status berwarna sesuai kondisi (hijau untuk "Aman", dsb).

---

# 14. Tech Stack

**Frontend**
React, Vite, TailwindCSS, React Router, TanStack Query, React Leaflet, Recharts, Framer Motion

**Backend**
Supabase, PostgreSQL

**Realtime**
MQTT, Supabase Realtime

**Authentication**
Supabase Auth

**AI**
GRU Soft-Sensing Model

**Maps**
OpenStreetMap

---

# 15. Future Enhancements

- Multi Industrial Zone
- Mobile Application
- Push Notification (WhatsApp/SMS)
- AI Anomaly Detection
- Predictive Maintenance
- Weather Integration
- Multi-language Support
- Implementasi penuh Design Considerations pada Bagian 12