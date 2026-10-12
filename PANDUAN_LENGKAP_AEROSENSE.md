# AEROSENSE — Panduan Lengkap Proyek GRU Soft-Sensing

> **Sistem koreksi kualitas udara berbasis Edge AI** menggunakan model GRU (Gated Recurrent Unit) yang berjalan di Raspberry Pi 4 sebagai gateway, menerima data dari node sensor ESP32-S3 via LoRa.

---

## Daftar Isi

1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Struktur Folder & Penjelasan File](#3-struktur-folder--penjelasan-file)
4. [Alur Data End-to-End](#4-alur-data-end-to-end)
5. [Tahap A — Training Model (di PC/Laptop)](#5-tahap-a--training-model-di-pclaptop)
6. [Tahap B — Deploy ke Raspberry Pi](#6-tahap-b--deploy-ke-raspberry-pi)
7. [Tahap C — Setup Hardware Lengkap (Sensor + LoRa + Pi)](#7-tahap-c--setup-hardware-lengkap-sensor--lora--pi)
8. [Tahap D — Verifikasi & Menjalankan Sebagai Service](#8-tahap-d--verifikasi--menjalankan-sebagai-service)
9. [Tahap E — Pengumpulan Data Lapangan & Retraining](#9-tahap-e--pengumpulan-data-lapangan--retraining)
10. [Validasi Arsitektur (UCI Benchmark)](#10-validasi-arsitektur-uci-benchmark)
11. [Troubleshooting](#11-troubleshooting)
12. [Catatan Penting & Batasan](#12-catatan-penting--batasan)

---

## 1. Gambaran Umum Proyek

AEROSENSE adalah sistem **soft-sensing** yang bertujuan mengoreksi bias bacaan sensor kualitas udara murah (PM2.5, eCO2, TVOC) yang disebabkan oleh **cross-sensitivity** terhadap suhu dan kelembapan.

### Apa Masalahnya?

Sensor gas murah (seperti SGP30 untuk eCO2/TVOC dan Sharp GP2Y1010AU0F untuk PM2.5) memberikan bacaan yang menyimpang ketika suhu tinggi (≥ 28.8°C) dan kelembapan tinggi (≥ 80%) terjadi bersamaan. Kondisi ini umum terjadi di wilayah industri tropis seperti Gresik/Surabaya.

### Apa Solusinya?

Model GRU (2 layer, 64 hidden units) dilatih untuk mempelajari pola bias ini, lalu mengoreksi bacaan sensor mentah menjadi estimasi yang lebih akurat:

```
Input:  suhu, kelembapan, pm25_raw, eco2_raw, tvoc_raw  (5 fitur × 24 timestep)
Output: pm25_clean, eco2_clean, tvoc_clean               (3 nilai terkoreksi)
```

### Alur Kerja Singkat

```
Node ESP32-S3 + Sensor
        │
        │  (LoRa / tiap 5 menit)
        ▼
Raspberry Pi 4 (Edge AI Gateway)
   ├─ Terima data  →  Buffer per node
   ├─ Preprocessing →  Outlier removal, interpolasi, moving average
   ├─ Inferensi     →  Model ONNX (GRU)
   ├─ Denormalisasi →  Konversi balik ke satuan asli (µg/m³, ppm, ppb)
   └─ Kirim hasil   →  Supabase (HTTP/REST) → n8n (alert)
```

---

## 2. Arsitektur Sistem

### Diagram Arsitektur

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  NODE SENSOR (ESP32-S3) │     │  NODE SENSOR (ESP32-S3) │
│  ┌───────┐ ┌──────────┐│     │  ┌───────┐ ┌──────────┐│
│  │SGP30  │ │Sharp PM  ││     │  │SGP30  │ │Sharp PM  ││
│  │(eCO2, │ │(PM2.5)   ││     │  │(eCO2, │ │(PM2.5)   ││
│  │ TVOC) │ │          ││     │  │ TVOC) │ │          ││
│  └───┬───┘ └────┬─────┘│     │  └───┬───┘ └────┬─────┘│
│      │   ┌──────┘      │     │      │   ┌──────┘      │
│  ┌───┴───┴───┐         │     │  ┌───┴───┴───┐         │
│  │  AM2301   │         │     │  │  AM2301   │         │
│  │(suhu,hum) │         │     │  │(suhu,hum) │         │
│  └─────┬─────┘         │     │  └─────┬─────┘         │
│        ▼               │     │        ▼               │
│  ┌───────────┐         │     │  ┌───────────┐         │
│  │EBYTE E220 │ )))     │     │  │EBYTE E220 │ )))     │
│  │ (LoRa TX) │         │     │  │ (LoRa TX) │         │
│  └───────────┘         │     │  └───────────┘         │
└─────────────────────────┘     └─────────────────────────┘
             LoRa 920-923 MHz                LoRa
                    │                          │
                    ▼                          ▼
          ┌─────────────────────────────────────────┐
          │         RASPBERRY PI 4 (GATEWAY)        │
          │  ┌───────────┐                          │
          │  │EBYTE E220 │  ← modul penerima LoRa   │
          │  │ (LoRa RX) │                          │
          │  └─────┬─────┘                          │
          │        ▼                                │
          │  ┌─────────────┐   ┌─────────────────┐  │
          │  │lora_receiver│──▶│ sensor_ingest.py │  │
          │  │     .py     │   │  (buffer/node)   │  │
          │  └─────────────┘   └────────┬────────┘  │
          │                             ▼           │
          │                    ┌─────────────────┐  │
          │                    │ preprocessing   │  │
          │                    │ + ONNX Inference│  │
          │                    └────────┬────────┘  │
          │                             ▼           │
          │               ┌──────────────────────┐  │
          │               │ Hasil: pm25_clean,   │  │
          │               │ eco2_clean,tvoc_clean │  │
          │               └──────────┬───────────┘  │
          │                          ▼              │
          │                  ┌──────────────┐       │
          │                  │  Supabase    │       │
          │                  │  (HTTP POST) │       │
          │                  └──────┬───────┘       │
          └─────────────────────────┼───────────────┘
                                    ▼
                            ┌──────────────┐
                            │  n8n (Alert) │
                            │  Dashboard   │
                            └──────────────┘
```

### Komponen Model GRU

| Parameter        | Nilai   | Keterangan                                        |
|-------------------|---------|--------------------------------------------------|
| Arsitektur        | GRU     | Lebih ringan dari LSTM, cocok untuk Pi 4          |
| Jumlah Layer      | 2       | Stacked GRU                                      |
| Hidden Size       | 64      | Unit tersembunyi per layer                       |
| Input Size        | 5       | suhu, kelembapan, pm25_raw, eco2_raw, tvoc_raw   |
| Output Size       | 3       | pm25_clean, eco2_clean, tvoc_clean               |
| Window Size       | 24      | 24 × 5 menit = 2 jam konteks                    |
| Dropout           | 0.2     | Antar layer GRU                                  |
| Format Deploy     | ONNX    | Ringan, tidak perlu PyTorch penuh di Pi          |

---

## 3. Struktur Folder & Penjelasan File

```
aerosense_gru/
│
├── 📄 model.py                  ← Definisi arsitektur GRU (PyTorch)
├── 📄 train.py                  ← Script training + export ONNX
├── 📄 generate_dummy_data.py    ← Generator data sintetik untuk training awal
├── 📄 preprocessing.py          ← Pipeline pembersihan data (dipakai training & inferensi)
├── 📄 inference_pi_example.py   ← Script inferensi untuk Raspberry Pi
├── 📄 sensor_ingest.py          ← Pengelola buffer per node + orkestrasi inferensi
├── 📄 lora_receiver.py          ← Penerima data LoRa dari serial port
├── 📄 gateway_server.py         ← HTTP server alternatif (Flask)
├── 📄 data_logger.py            ← Pencatat data mentah ke CSV (untuk retraining)
├── 📄 validate_uci_benchmark.py ← Validasi arsitektur dengan data UCI
├── 📄 requirements.txt          ← Daftar dependency
│
├── 📁 models/                   ← Artifact hasil training (DEPLOY KE PI)
│   ├── aerosense_gru.onnx       ← Model ONNX (yang dijalankan di Pi)
│   ├── input_scaler.json        ← Parameter normalisasi input (min/max)
│   ├── target_scaler.json       ← Parameter denormalisasi output
│   ├── model_config.json        ← Konfigurasi: window_size, ma_window, outlier_stats, dll.
│   ├── best_model.pt            ← Checkpoint PyTorch (TIDAK perlu ke Pi)
│   ├── aerosense_gru_scripted.pt← TorchScript (TIDAK perlu ke Pi)
│   └── training_curve.png       ← Grafik loss training (TIDAK perlu ke Pi)
│
├── 📁 models_validation/        ← Artifact validasi UCI (TIDAK perlu ke Pi)
│   ├── best_model_uci.pt
│   └── validation_result.json
│
└── 📁 data/
    ├── aerosense_dummy_dataset.csv   ← Dataset sintetik untuk training awal
    └── uci_air_quality_reference.csv ← Dataset UCI untuk validasi arsitektur
```

### Mana yang Perlu ke Raspberry Pi?

| File                        | Perlu ke Pi? | Keterangan                             |
|-----------------------------|:------------:|----------------------------------------|
| `models/aerosense_gru.onnx` | ✅ **Ya**    | Model yang dijalankan                  |
| `models/input_scaler.json`  | ✅ **Ya**    | Normalisasi input                      |
| `models/target_scaler.json` | ✅ **Ya**    | Denormalisasi output                   |
| `models/model_config.json`  | ✅ **Ya**    | Konfigurasi preprocessing              |
| `preprocessing.py`          | ✅ **Ya**    | Fungsi pembersihan data                |
| `inference_pi_example.py`   | ✅ **Ya**    | Script inferensi utama                 |
| `sensor_ingest.py`          | ✅ **Ya**    | Pengelola buffer (untuk mode produksi) |
| `lora_receiver.py`          | ✅ **Ya**    | Penerima data LoRa                     |
| `data_logger.py`            | ✅ **Ya**    | Pencatat data lapangan                 |
| `gateway_server.py`         | ⚡ Opsional  | Hanya jika pakai HTTP, bukan LoRa      |
| `train.py`                  | ❌ Tidak     | Hanya untuk training di PC             |
| `model.py`                  | ❌ Tidak     | Definisi model (hanya untuk training)  |
| `generate_dummy_data.py`    | ❌ Tidak     | Generator data sintetik                |
| `best_model.pt`             | ❌ Tidak     | Checkpoint PyTorch                     |
| `*.scripted.pt`             | ❌ Tidak     | TorchScript backup                     |

---

## 4. Alur Data End-to-End

### 4.1 Alur di Sisi Edge (Raspberry Pi)

```
Data Masuk (JSON/CSV via LoRa)
       │
       ▼
┌──────────────────────────────────────────────┐
│  1. Buffer per node_id                       │
│     Setiap reading yang masuk ditampung       │
│     di deque (max 200 baris per node)        │
│     + dicatat ke collected_field_data.csv     │
└──────────────────┬───────────────────────────┘
                   │  Buffer ≥ 28 baris?
                   │  (window_size 24 + ma_window 5 - 1)
                   ▼
┌──────────────────────────────────────────────┐
│  2. Deteksi Outlier (Z-Score)                │
│     Mean/std referensi dari data training,   │
│     BUKAN dari buffer kecil saat ini         │
│     Threshold: z > 3.5 → tandai NaN         │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│  3. Interpolasi Linear                       │
│     Isi bagian NaN (sensor putus koneksi     │
│     atau outlier yang sudah ditandai)        │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│  4. Moving Average (window = 5)              │
│     Causal (hanya data masa lalu)            │
│     Meredam fluktuasi sesaat                 │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│  5. Ambil 24 baris terakhir                  │
│     4 baris di atas hanya "pemanasan"        │
│     agar smoothing di awal window tidak      │
│     terpotong                                │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│  6. Normalisasi Min-Max                      │
│     Pakai parameter dari input_scaler.json   │
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│  7. Inferensi ONNX (GRU)                     │
│     Input:  (1, 24, 5) float32               │
│     Output: (3,) float32 — masih ternormalisasi│
└──────────────────┬───────────────────────────┘
                   ▼
┌──────────────────────────────────────────────┐
│  8. Denormalisasi                            │
│     Konversi balik ke satuan asli            │
│     pakai target_scaler.json                 │
│     → pm25_clean (µg/m³)                     │
│     → eco2_clean (ppm)                       │
│     → tvoc_clean (ppb)                       │
└──────────────────┬───────────────────────────┘
                   ▼
          Kirim ke Supabase (HTTP/REST)
```

### 4.2 Format Data dari Node

Setiap node mengirim data dalam format CSV melalui LoRa:

```
NODE_SIDOMORO_01,81,31.2,610,145,42.1,78.5
```

Urutan kolom: `node_id, counter, suhu, eco2_raw, tvoc_raw, pm25_raw, kelembapan`

Atau dalam format JSON (jika firmware diubah):

```json
{
  "node_id": "NODE_SIDOMORO_01",
  "suhu": 31.2,
  "kelembapan": 78.5,
  "pm25_raw": 42.1,
  "eco2_raw": 610.3,
  "tvoc_raw": 145.2
}
```

---

## 5. Tahap A — Training Model (di PC/Laptop)

> **Tahap ini dilakukan di komputer development, BUKAN di Raspberry Pi.**

### 5.1 Persyaratan

- Python 3.9+
- GPU opsional (CPU juga bisa, training cepat karena model kecil)

### 5.2 Install Dependency Training

```bash
pip install torch>=2.2 pandas>=2.0 numpy>=1.24 matplotlib>=3.7 onnx>=1.15 onnxscript>=0.1
```

Atau langsung dari requirements.txt:

```bash
pip install -r requirements.txt
```

### 5.3 Generate Data Sintetik (Jika Belum Ada Data Lapangan)

```bash
python generate_dummy_data.py
```

Menghasilkan `data/aerosense_dummy_dataset.csv` — data sintetik 5 node × 20 hari × 288 reading/hari, dengan pola:
- Siklus suhu/kelembapan harian (mengacu iklim Surabaya-Gresik dari BMKG)
- PM2.5 baseline ~20 µg/m³, puncak ~65 µg/m³ (mengacu data BPS/BMKG Surabaya 2019)
- Cross-sensitivity bias yang memburuk saat suhu ≥ 28.8°C dan kelembapan ≥ 80%
- Missing values (2%) dan outlier spikes (1%) sengaja disuntikkan

### 5.4 Jalankan Training

```bash
python train.py
```

**Apa yang terjadi:**
1. Baca dataset CSV
2. Preprocessing per node: outlier clip → interpolasi → moving average → min-max scaling → sliding window
3. Split data secara kronologis (70% train, 15% val, 15% test — **tidak di-shuffle**, karena time series)
4. Training dengan early stopping (patience = 8 epoch)
5. Evaluasi di test set → cetak RMSE dan MAE
6. Export ke beberapa format:

**Output di folder `models/`:**

| File                          | Fungsi                                          |
|-------------------------------|------------------------------------------------|
| `aerosense_gru.onnx`         | **Model utama untuk Pi** (ONNX Runtime)         |
| `input_scaler.json`          | Parameter normalisasi input (min/max per kolom) |
| `target_scaler.json`         | Parameter denormalisasi output                  |
| `model_config.json`          | Semua parameter preprocessing yang harus sama   |
| `best_model.pt`              | Checkpoint PyTorch (untuk lanjut training)       |
| `aerosense_gru_scripted.pt`  | TorchScript (backup jika ONNX bermasalah)       |
| `training_curve.png`         | Visualisasi loss training vs validation          |

### 5.5 Hyperparameter Training

| Parameter       | Nilai  | Di Mana Diubah     |
|-----------------|--------|---------------------|
| `WINDOW_SIZE`   | 24     | `train.py` baris 33 |
| `MA_WINDOW`     | 5      | `train.py` baris 34 |
| `Z_THRESH`      | 3.5    | `train.py` baris 35 |
| `HIDDEN_SIZE`   | 64     | `train.py` baris 36 |
| `BATCH_SIZE`    | 64     | `train.py` baris 38 |
| `EPOCHS`        | 60     | `train.py` baris 39 |
| `LEARNING_RATE` | 1e-3   | `train.py` baris 40 |
| `PATIENCE`      | 8      | `train.py` baris 41 |

> ⚠️ **Penting:** Jika `WINDOW_SIZE` atau `MA_WINDOW` diubah, model harus **ditraining ulang dari awal**. Jangan hanya mengedit `model_config.json` secara manual — bobot model yang sudah dilatih tidak akan otomatis menyesuaikan.

---

## 6. Tahap B — Deploy ke Raspberry Pi

### 6.1 Persyaratan Sistem

| Komponen     | Spesifikasi                                  |
|--------------|----------------------------------------------|
| Board        | Raspberry Pi 4 Model B, RAM 4GB atau 8GB     |
| OS           | Raspberry Pi OS Bookworm, **64-bit** (aarch64)|
| Python       | 3.9 ke atas                                   |
| Koneksi      | Internet aktif (untuk instalasi paket)        |

### 6.2 Verifikasi Arsitektur OS

```bash
uname -m
```

> **Harus** menampilkan `aarch64`. Jika hasilnya `armv7l`, OS masih 32-bit — library `onnxruntime` dari PyPI **tidak tersedia** untuk arsitektur tersebut. Anda harus menginstal ulang OS ke versi 64-bit terlebih dahulu.

### 6.3 Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
```

### 6.4 Install Dependency Python

**Minimal (untuk demo/uji coba saja):**

```bash
pip install onnxruntime numpy pandas --break-system-packages
```

**Lengkap (untuk mode produksi dengan LoRa):**

```bash
pip install onnxruntime numpy pandas pyserial --break-system-packages
```

**Opsional tambahan:**

```bash
# Jika menggunakan HTTP server (gateway_server.py) sebagai alternatif LoRa:
pip install flask --break-system-packages

# Jika menggunakan MQTT:
pip install paho-mqtt --break-system-packages
```

### 6.5 Verifikasi Instalasi

```bash
python3 -c "import onnxruntime; print(onnxruntime.__version__)"
```

Jika muncul nomor versi tanpa error, instalasi berhasil.

### 6.6 Transfer File ke Raspberry Pi

Dari komputer development, jalankan:

```bash
scp -r models/ preprocessing.py inference_pi_example.py \
      sensor_ingest.py lora_receiver.py data_logger.py \
      pi@<alamat-ip-pi>:/home/pi/aerosense/
```

Juga buat folder data di Pi:

```bash
ssh pi@<alamat-ip-pi> "mkdir -p /home/pi/aerosense/data"
```

### 6.7 Struktur Folder di Raspberry Pi

```
/home/pi/aerosense/
├── inference_pi_example.py
├── preprocessing.py
├── sensor_ingest.py
├── lora_receiver.py
├── data_logger.py
├── data/                        ← akan terisi otomatis oleh data_logger.py
│   └── collected_field_data.csv ← data mentah dari sensor (tumbuh terus)
└── models/
    ├── aerosense_gru.onnx
    ├── input_scaler.json
    ├── target_scaler.json
    └── model_config.json
```

### 6.8 Uji Coba Cepat (Tanpa Sensor)

Untuk memastikan model berjalan tanpa perlu hardware sensor:

```bash
cd /home/pi/aerosense

# Salin juga data dummy untuk demo:
# (dari komputer development)
scp data/aerosense_dummy_dataset.csv pi@<ip>:/home/pi/aerosense/data/

# Jalankan demo
python3 inference_pi_example.py
```

**Output yang diharapkan:**

```
soft-sensing output (corrected, cross-sensitivity filtered):
  pm25_clean  : 23.456
  eco2_clean  : 445.123
  tvoc_clean  : 102.789

preprocessing + inference took 15.23 ms ...
```

Jika berhasil, Anda sudah memastikan bahwa model ONNX, scaler, dan preprocessing berfungsi dengan benar di Pi.

---

## 7. Tahap C — Setup Hardware Lengkap (Sensor + LoRa + Pi)

### 7.1 Daftar Komponen

**Per Node Sensor:**

| Komponen                | Fungsi                           | Interface |
|-------------------------|----------------------------------|-----------|
| ESP32-S3 dev board      | Mikrokontroler utama node        | —         |
| SGP30                   | Sensor eCO2 dan TVOC             | I2C       |
| Sharp GP2Y1010AU0F      | Sensor PM2.5 (debu halus)        | Analog    |
| AM2301 (DHT21)          | Sensor suhu dan kelembapan       | Digital   |
| EBYTE E220-900T22D      | Modul LoRa (pengirim)           | UART      |
| Antena SMA              | Untuk modul LoRa                 | —         |
| Catu daya               | Baterai atau adaptor             | —         |

**Di Sisi Gateway (Raspberry Pi):**

| Komponen                | Fungsi                           |
|-------------------------|----------------------------------|
| Raspberry Pi 4          | Edge AI Gateway                  |
| EBYTE E220-900T22D      | Modul LoRa (penerima)           |
| Antena SMA              | Untuk modul LoRa                 |
| Kabel jumper / USB-TTL  | Koneksi modul ke Pi              |

### 7.2 Wiring Node Sensor (ESP32-S3)

```
┌──────────────────────────────────────────────────────┐
│  ESP32-S3 Dev Board                                  │
│                                                      │
│  SGP30 (I2C):                                        │
│    SDA  ──────────── GPIO8                           │
│    SCL  ──────────── GPIO9                           │
│                                                      │
│  Sharp PM2.5 (ADC):                                  │
│    Analog Out ────── GPIO1-10 (ADC1) atau            │
│                      GPIO11-20 (ADC2)                │
│    ℹ️ Bebas pilih, tidak ada konflik WiFi            │
│       karena node connect lewat LoRa                 │
│                                                      │
│  AM2301 (Digital):                                   │
│    Data pin ──────── GPIO bebas (yang belum terpakai)│
│                                                      │
│  EBYTE E220 (UART2):                                 │
│    Modul TXD ─────── ESP32 RX2 (misal GPIO17)       │
│    Modul RXD ─────── ESP32 TX2 (misal GPIO18)       │
│    M0 ────────────── GND (mode transparan)           │
│    M1 ────────────── GND (mode transparan)           │
│                                                      │
│  ⚠️ HINDARI pin berikut:                             │
│    GPIO0, GPIO3, GPIO45, GPIO46 (strapping pin)      │
│    GPIO19, GPIO20 (USB native)                       │
└──────────────────────────────────────────────────────┘
```

> **Catatan:** Modul EBYTE E220 beroperasi pada 3.3V logic level, sama dengan ESP32-S3 — **tidak perlu level shifter**.

### 7.3 Konfigurasi Modul LoRa (WAJIB Sebelum Dipasang!)

Modul E220-900T22D **default di 868.125 MHz** (band Eropa). Ini **harus diubah** ke **920–923 MHz** (alokasi AS923 untuk Indonesia) di **KEDUA modul** (node dan gateway).

**Langkah konfigurasi:**

1. Set **M0 = HIGH**, **M1 = HIGH** (mode konfigurasi, baud otomatis 9600 bps)
2. Sambungkan ke komputer via USB-TTL adapter
3. Buka software **RF Setting** dari EBYTE, atau kirim AT command manual
4. Ubah channel ke frekuensi dalam rentang **920–923 MHz**
5. Set **M0 = LOW**, **M1 = LOW** untuk kembali ke mode transparan (operasional)

> ⚠️ **PENTING:** Node dan gateway **HARUS** disetel ke channel yang **PERSIS SAMA**. Jika berbeda, kedua modul tidak akan saling mendengar. Konfigurasi ini dilakukan **sekali per modul**, tidak perlu setiap kali dinyalakan.

### 7.4 Wiring Modul LoRa ke Raspberry Pi

```
Modul EBYTE E220          Raspberry Pi 4
─────────────────         ─────────────────
VCC  ──────────────────── 3.3V
GND  ──────────────────── GND
TXD  ──────────────────── RXD (GPIO15)
RXD  ──────────────────── TXD (GPIO14)
M0   ──────────────────── GND
M1   ──────────────────── GND
```

**Konfigurasi UART Pi:**

Jika menggunakan pin GPIO UART (bukan USB-TTL adapter), serial console bawaan Pi OS **harus dimatikan** terlebih dahulu:

```bash
sudo raspi-config
# → Interface Options → Serial Port
#   → Login shell over serial: No
#   → Serial hardware enabled: Yes
```

**Alternatif lebih mudah:** Gunakan adapter USB-to-TTL terpisah. Device akan muncul sebagai `/dev/ttyUSB0` dan tidak perlu mengubah konfigurasi sistem Pi.

### 7.5 Firmware ESP32-S3

> ⚠️ **Firmware ESP32-S3 belum termasuk dalam proyek ini.** Yang disediakan adalah urutan logika yang perlu diimplementasikan menggunakan Arduino IDE atau PlatformIO.

**Logika per siklus (setiap 5 menit):**

1. Baca SGP30 via I2C → `eco2_raw`, `tvoc_raw`
2. Baca Sharp PM2.5 via ADC → konversi tegangan ke µg/m³ → `pm25_raw`
3. Baca AM2301 → `suhu`, `kelembapan`
4. Susun menjadi satu baris CSV:
   ```
   NODE_SIDOMORO_01,81,31.2,610,145,42.1,78.5
   ```
5. Kirim ke UART2 (yang tersambung ke modul EBYTE), diakhiri newline
6. Tidur/tunggu sampai siklus berikutnya

---

## 8. Tahap D — Verifikasi & Menjalankan Sebagai Service

### 8.1 Verifikasi Bertahap

**Tes satu per satu, jangan langsung nyalakan semuanya bersamaan.**

**Langkah 1 — Test penerima LoRa (tanpa node menyala):**

```bash
cd /home/pi/aerosense
python3 lora_receiver.py --port /dev/serial0
# Atau jika pakai USB-TTL adapter:
python3 lora_receiver.py --port /dev/ttyUSB0
```

Output yang diharapkan:
```
dengerin di /dev/serial0 @ 9600 baud, tunggu reading dari node...
```
(Diam menunggu — belum ada yang mengirim.)

**Langkah 2 — Nyalakan satu node, biarkan beberapa siklus:**

Di terminal `lora_receiver.py` akan mulai muncul:
```
buffering... (NODE_01,1,31.2,...)
buffering... (NODE_01,2,30.8,...)
...
```

**Langkah 3 — Tunggu hingga buffer penuh:**

Setelah **28 reading** dari node yang sama terkumpul (jika interval 5 menit, ini sekitar **2 jam 20 menit**), akan muncul:
```
hasil koreksi: {"node_id": "NODE_01", "pm25_clean": 23.4, "eco2_clean": 445.1, "tvoc_clean": 102.8, ...}
```

**Langkah 4 — Cek data yang terkumpul:**

```bash
python3 -c "from data_logger import count_logged_rows; print(count_logged_rows())"
```

Angka ini harus terus naik — `data_logger.py` mencatat **semua** reading, bukan hanya yang cukup untuk inferensi.

### 8.2 Menjalankan Sebagai Systemd Service

Agar program berjalan otomatis setelah reboot:

**Buat file service:**

```bash
sudo nano /etc/systemd/system/aerosense-gateway.service
```

**Isi file:**

```ini
[Unit]
Description=AEROSENSE Edge Gateway
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/aerosense/lora_receiver.py --port /dev/serial0
WorkingDirectory=/home/pi/aerosense
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

> **Catatan:** Ubah `ExecStart` sesuai kebutuhan:
> - Jika pakai LoRa: `lora_receiver.py --port /dev/serial0`
> - Jika pakai demo tanpa sensor: `inference_pi_example.py`
> - Jika pakai HTTP: `gateway_server.py`

**Aktifkan dan jalankan:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable aerosense-gateway
sudo systemctl start aerosense-gateway
```

**Perintah monitoring:**

```bash
# Cek status service
sudo systemctl status aerosense-gateway

# Lihat log real-time
journalctl -u aerosense-gateway -f

# Restart service
sudo systemctl restart aerosense-gateway

# Matikan service
sudo systemctl stop aerosense-gateway
```

---

## 9. Tahap E — Pengumpulan Data Lapangan & Retraining

### 9.1 Data yang Terkumpul Otomatis

File `data/collected_field_data.csv` terisi otomatis setiap kali reading masuk. Kolom yang tersedia:

```
timestamp, node_id, suhu, kelembapan, pm25_raw, eco2_raw, tvoc_raw
```

> **Kolom `pm25_clean`, `eco2_clean`, `tvoc_clean` belum ada** — ini harus diisi secara manual dari alat referensi yang terkalibrasi.

### 9.2 Cara Mendapatkan Ground Truth

Ground truth **tidak bisa didapat dari sensor node itu sendiri**. Prosesnya manual:

1. Secara berkala (misal mingguan), bawa **alat ukur referensi** yang terkalibrasi ke lokasi node
2. Catat nilai sebenarnya pada saat itu
3. Cocokkan dengan baris di `collected_field_data.csv` yang timestamp-nya paling dekat
4. Tambahkan kolom `pm25_clean`, `eco2_clean`, `tvoc_clean` pada baris tersebut

### 9.3 Retraining dengan Data Lapangan

Setelah `collected_field_data.csv` memiliki **cukup baris dengan kolom `_clean` terisi** (idealnya minimal beberapa ratus baris per node):

```bash
# Di komputer development (bukan di Pi)

# 1. Salin data lapangan dari Pi
scp pi@<ip>:/home/pi/aerosense/data/collected_field_data.csv data/

# 2. Ganti dataset training
cp data/collected_field_data.csv data/aerosense_dummy_dataset.csv

# 3. Jalankan training ulang
python train.py

# 4. Bandingkan RMSE/MAE baru vs lama
```

### 9.4 Update Model di Raspberry Pi

Setelah retraining, cukup timpa 4 file di folder `models/`:

```bash
scp models/aerosense_gru.onnx models/input_scaler.json \
    models/target_scaler.json models/model_config.json \
    pi@<ip>:/home/pi/aerosense/models/
```

Lalu restart service:

```bash
ssh pi@<ip> "sudo systemctl restart aerosense-gateway"
```

> **Tidak perlu mengubah kode apa pun**, selama arsitektur model (window_size, jumlah fitur input) tidak berubah.

---

## 10. Validasi Arsitektur (UCI Benchmark)

File `validate_uci_benchmark.py` berisi eksperimen terpisah yang **bukan bagian dari deployment** — tujuannya membuktikan bahwa arsitektur GRU yang dipakai AEROSENSE **mampu** mempelajari koreksi bias sensor dari data sensor **sungguhan**.

### Dataset

**UCI Air Quality Dataset** (De Vito et al., 2008) — sensor multisensor gas murah di pinggir jalan raya di Italia, Maret 2004 – Februari 2005. Mengandung cross-sensitivity dan sensor drift yang terdokumentasi secara eksplisit.

### Pemetaan Kolom

| Slot AEROSENSE           | Diisi dari UCI                   |
|--------------------------|----------------------------------|
| suhu, kelembapan         | T, RH                           |
| pm25_raw / pm25_clean    | PT08.S1 (sensor CO) / CO(GT)    |
| eco2_raw / eco2_clean    | PT08.S3 (sensor NOx) / NOx(GT)  |
| tvoc_raw / tvoc_clean    | PT08.S4 (sensor NO2) / NO2(GT)  |

### Hasil

| Target | RMSE           | MAE            |
|--------|----------------|----------------|
| CO     | 0.957 mg/m³    | 0.780 mg/m³    |
| NOx    | 188.994 ppb    | 168.540 ppb    |
| NO2    | 33.426 µg/m³   | 25.672 µg/m³   |

### Kesimpulan

Arsitektur (GRU 2 layer, koreksi berbasis suhu + kelembapan + raw sensor) **bekerja secara struktural** di data sensor asli, termasuk kasus cross-sensitivity yang lebih rumit dari yang disimulasikan. Ini **validasi metode**, bukan proyeksi performa lapangan AEROSENSE.

---

## 11. Troubleshooting

### Model Berjalan Tapi Hasilnya Aneh

- **Penyebab paling umum:** 4 file di `models/` tidak berasal dari training run yang sama
- **Cara cek:** Lihat field `trained_at` di `model_config.json` — tanggal harus konsisten
- **Solusi:** Pastikan `aerosense_gru.onnx`, `input_scaler.json`, `target_scaler.json`, dan `model_config.json` semuanya dihasilkan dari `train.py` yang sama

### Error `import onnxruntime` di Pi

- Pastikan OS 64-bit: `uname -m` → harus `aarch64`
- Jika `armv7l`, instal ulang OS ke versi 64-bit
- Alternatif jika wheel ONNX tidak tersedia: konversi model ke TensorFlow Lite, atau build onnxruntime dari source

### Error `ValueError: buffer has X rows, need at least 28`

- Buffer node belum cukup panjang — tunggu sampai 28 reading terkumpul
- Jika interval kirim 5 menit, ini membutuhkan sekitar **2 jam 20 menit**

### LoRa Tidak Menerima Data

- Pastikan **kedua modul** (node dan gateway) disetel ke **channel yang sama**
- Pastikan M0 dan M1 di-ground (mode transparan)
- Cek wiring TXD/RXD (jangan terbalik)
- Pastikan serial console Pi sudah dimatikan jika pakai GPIO UART

### Error `ModuleNotFoundError: No module named 'preprocessing'`

- Pastikan `preprocessing.py` ada di folder yang sama dengan script yang dijalankan
- Pastikan working directory benar: `cd /home/pi/aerosense`

### Paket LoRa Hilang (Counter Melompat)

- `lora_receiver.py` otomatis mendeteksi dan melaporkan paket yang hilang
- Sesekali wajar terjadi di komunikasi radio LoRa
- Jika sering terjadi, periksa jarak, interferensi, dan orientasi antena

---

## 12. Catatan Penting & Batasan

### Status Saat Ini

| Aspek                                    | Status                      |
|------------------------------------------|-----------------------------|
| Model GRU (training + export ONNX)       | ✅ Selesai                   |
| Pipeline preprocessing (training = edge) | ✅ Selesai, konsisten        |
| Script inferensi untuk Pi                | ✅ Selesai                   |
| Penerima LoRa + buffer + logging         | ✅ Selesai                   |
| Validasi arsitektur (UCI)                | ✅ Selesai                   |
| Firmware ESP32-S3                        | ⚠️ Belum ditulis kodenya     |
| Test di Raspberry Pi fisik               | ⚠️ Belum dilakukan           |
| Data lapangan (sensor asli)              | ⚠️ Belum ada                 |
| Ground truth dari alat referensi         | ⚠️ Belum ada                 |
| Koneksi ke Supabase                      | ⚠️ Belum diimplementasikan   |
| Koneksi ke n8n (alert system)            | ⚠️ Belum diimplementasikan   |

### Hal yang Harus Diingat

1. **Data saat ini masih sintetik.** Model dilatih dari pola matematis, bukan sensor sungguhan. Begitu data lapangan tersedia, **training ulang wajib dilakukan**.

2. **Jangan edit `model_config.json` secara manual** untuk mengubah `window_size` atau `ma_window`. Ubah di `train.py`, lalu jalankan training ulang.

3. **Waktu inferensi ~15ms** diukur di CPU laptop. Di Pi 4 kemungkinan lebih lambat, tapi masih jauh di bawah batas 3 detik. Bottleneck sesungguhnya adalah round-trip MQTT/HTTP, bukan model.

4. **Jika interval kirim node berubah dari 5 menit**, `WINDOW_SIZE` dan `MA_WINDOW` harus disesuaikan di `train.py`, lalu training ulang dari awal.

5. **`preprocessing.py` adalah satu-satunya sumber kebenaran** untuk pipeline pembersihan data. File ini dipakai oleh `train.py` (saat training) dan `inference_pi_example.py` (saat inferensi), sehingga kedua pipeline **tidak bisa berbeda secara tidak sengaja**.

---

> **Dokumen ini disusun dari:** `README.md`, `INSTALASI.txt`, `IMPLEMENTASI_LAPANGAN.txt`, `VALIDASI.md`, dan seluruh source code proyek AEROSENSE.
