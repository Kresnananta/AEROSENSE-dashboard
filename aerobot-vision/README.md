# AEROBOT Vision – Deteksi Orang & Pemicu Sapaan

Modul kamera untuk AEROBOT: mendeteksi orang (YOLOv8), melacaknya (ByteTrack),
lalu mengirim **event** ke sistem utama robot agar robot menyapa / menawarkan info kualitas udara.

```
aerobot_vision/
├── config.yaml                  # semua parameter (model, kamera, perilaku sapaan, URL event)
├── requirements.txt
├── aerobot_vision/              # paket utama (jalan di komputer robot)
│   ├── detector.py              # loop kamera -> YOLO track -> behavior -> event
│   ├── behavior.py              # logika kapan menyapa (bisa diuji tanpa kamera)
│   └── events.py                # kirim event via HTTP POST / stdout
├── scripts/
│   ├── extract_and_prelabel.py  # LANGKAH 1: video -> frame + label otomatis
│   ├── train_roboflow.py        # LANGKAH 2: fine-tune dari dataset Roboflow
│   └── event_receiver_example.py# contoh penerima event (uji integrasi)
├── notebooks/train_colab.ipynb  # training di Google Colab (GPU gratis)
├── models/                      # taruh best.pt / best.onnx di sini
└── tests/test_behavior.py
```

## 0. Instalasi
```bash
pip install -r requirements.txt
```

## 1. Coba dulu dengan model bawaan (tanpa training)
Model COCO sudah mengenali "person". Uji di lokasi dengan kamera robot:
```bash
python -m aerobot_vision --config config.yaml --show
```
Kotak **hijau** = orang dianggap "dekat & di depan robot" (kandidat disapa), abu-abu = jauh/samping.
Garis biru = batas `center_zone`. Tekan `q` untuk keluar.

Kalau deteksinya sudah bagus, Anda **tidak perlu training** – langsung ke langkah 4.

## 2. Siapkan dataset (jika perlu fine-tune)
1. Rekam video dari kamera robot di lokasi target, variasikan waktu (pagi/siang/sore/malam).
   Simpan video untuk **test** terpisah (mis. hari/sesi berbeda):
   ```
   rekaman/train/*.mp4
   rekaman/test/*.mp4
   ```
2. Ekstrak frame + pre-label otomatis:
   ```bash
   python scripts/extract_and_prelabel.py --videos "rekaman/train/*.mp4" --out dataset_train
   python scripts/extract_and_prelabel.py --videos "rekaman/test/*.mp4"  --out dataset_test
   ```
   | Opsi | Default | Arti |
   |---|---|---|
   | `--every` | 1.0 | ambil 1 frame tiap N detik |
   | `--diff` | 4.0 | buang frame yang hampir sama (0 = matikan) |
   | `--neg-ratio` | 0.10 | porsi maks. frame tanpa orang (background); `-1` = simpan semua |
   | `--model` | yolov8x.pt | model besar untuk pre-label (lebih akurat) |
   | `--conf` | 0.35 | ambang confidence pre-label |
3. Di Roboflow: buat project **Object Detection**, upload `dataset_train` (split **Train/Valid**),
   lalu upload `dataset_test` dan pilih split **Test**.
4. **Review** semua kotak: hapus yang salah, tambah yang terlewat. Frame tanpa kotak:
   pastikan memang tidak ada orang, lalu **Mark Null**.
5. Generate version: Resize 640, augmentasi (brightness ±25%, blur, noise, flip horizontal).
   Export format **YOLOv8**.

## 3. Training
Paling mudah: buka `notebooks/train_colab.ipynb` di Google Colab (GPU). Atau di PC ber-GPU:
```bash
export ROBOFLOW_API_KEY=xxxx
python scripts/train_roboflow.py --workspace NAMA_WS --project NAMA_PROJECT --version 1
```
Salin `best.pt` (atau `best.onnx`) ke `models/`, lalu set `model:` di `config.yaml`.
Format export: `--export onnx` (umum/CPU), `openvino` (mini PC Intel), `engine` (Jetson).

## 4. Integrasi dengan robot AERO-BOT (alur gabungan)

```
kamera (aerobot_vision) --POST /presence--> hub robot-display/start.mjs (mini PC, AEROBOT_PRESENCE=camera)
        ^                                     | GET /presence/events: robot_state / robot_wake / robot_sleep
        | monitor dada ikut hub               v
   ON saat bangun, standby saat tidur     Chrome kiosk: aerosense.me/aerobot (layar dada, akun robot)
                                            |-- wajah tablet /robot-screen: animasi bangun / tidur
                                            |-- mode dengar ON / OFF
                                            '-- sapaan Gemini dari workflow n8n (kondisi udara + cuaca
                                                hari ini), suara /aerobot, lalu langsung mendengarkan
```

- **Tidur cepat, layar hemat daya.** Tanpa orang 5 detik (`AEROBOT_SLEEP_AFTER_MS=5000`) wajah tidur
  dan mode dengar mati, kamera siaga. Monitor dada baru mati setelah robot tidur 5 menit
  (`robot.display_off_delay_s: 300`), supaya layar tidak berkedip tiap ada orang lewat.
- **Satu sapaan per bangun.** Orang datang lagi setelah robot tidur akan disapa lagi. Reload halaman
  tidak menyapa ulang.
- **Wajah tablet mengikuti status robot.** Setelah "Aktifkan wajah" ditekan saat start-up, wajah tidur
  dalam 5 detik jika tidak ada orang, lalu bangun + sapaan saat kamera melihat orang.
- Selama halaman dada tersambung, hub tidak mengirim `presence` ke API, jadi tidak ada sapaan ganda.
- Jika workflow gagal, robot memakai sapaan tetap "Halo, saya AERO-BOT. Ada yang bisa saya bantu?".

**Pemasangan:**
1. Server: deploy repo ini dengan `bash scripts/deploy-robot-screen.sh` (API + web, dengan backup
   & rollback otomatis).
2. Mini PC: Node.js 22 dan Python, clone repo ini. Folder `aerobot-vision/` (program kamera) dan
   `robot-display/` (hub) ada di repo yang sama. Buat venv di `aerobot-vision/`
   (`python -m venv venv`, lalu `venv/Scripts/python.exe -m pip install -r requirements.txt`),
   lalu jalankan `aerobot-vision/scripts/start_robot.bat`. Pertama kali dengan `set SETUP=1`: login akun robot,
   izinkan mikrofon dan "akses jaringan lokal".
3. Tablet: `aerosense.me/robot-screen` dengan akun robot yang sama, ketuk "Aktifkan wajah".
4. Windows: *Turn off display* = Never (program kamera yang mengatur layar).

Pengaturan di `config.yaml > robot` (`mode: hub`) dan `robot_display.url`
(`http://127.0.0.1:4210/presence`, wajib `127.0.0.1`). Lama tidur diatur di hub
(`AEROBOT_SLEEP_AFTER_MS`; `scripts/start_robot.bat` memakai 5000 = 5 detik).

**Uji di laptop tanpa robot:** jalankan hub (`cd robot-display` lalu
`AEROBOT_PRESENCE=camera AEROBOT_SLEEP_AFTER_MS=20000 node start.mjs`), program kamera, lalu buka
`https://aerosense.me/aerobot?camera=1` (setelah patch di-deploy). Judul chat menampilkan
"kamera tersambung". Di Windows layar laptop benar-benar mati saat robot tidur; pakai
`display_control: off` jika tidak mau.

### Mode standalone + simulator
`robot.mode: standalone` dan `robot_display.url: ""`: program ini memutuskan bangun/tidur sendiri
dan menyiarkan di `http://127.0.0.1:8765/events`. Simulator: `cd web && python -m http.server 8090`,
buka `http://127.0.0.1:8090/robot_sim.html`.

### Menyetel perilaku (`config.yaml > behavior`)
- `near_ratio`: makin besar = orang harus makin dekat untuk disapa. Ukur: berdiri di jarak
  sapa ideal (±1,5–2 m), lihat angka di atas kotak pada mode `--show`, pakai angka itu.
- `global_cooldown`: jeda antar sapaan, supaya robot tidak "cerewet" di gang ramai.
- Orang yang sama tidak disapa dua kali selama masih terlacak; jika pergi lebih dari
  `track_timeout` detik lalu kembali, ia boleh disapa lagi.

## Tes
```bash
python -m pytest tests -q
```

## Catatan
- **Privasi:** semua diproses di perangkat; tidak ada frame yang disimpan oleh detector.
- **Lisensi:** Ultralytics YOLOv8 berlisensi AGPL-3.0. Untuk produk komersial tertutup,
  diperlukan lisensi enterprise Ultralytics.
