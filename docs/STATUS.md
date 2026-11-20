# AEROSENSE — Status

## Tampilan web

- Warna OKLCH, batas alfa, dan radius berlapis dipakai pada panel dan kontrol web. Dasbor selalu menggunakan tema terang. Toolbar dan dialog memakai kaca dengan cadangan solid. Kontrol Peta Sensor menggunakan warna tema yang sama untuk titik acuan, pilihan lapisan, dan legenda.

- Landing, dasbor, Hub Lingkungan, chat, dan alur akun memakai permukaan dan kontrol yang seragam. Ilustrasi asli AEROSENSE dipakai untuk sensor, cuaca, kondisi lingkungan, dan maskot.
- Panel AERO-BOT menunjukkan ekspresi melalui balon dialog, waktu baca, dan saran untuk titik sensor yang dipakai chat. Jika data tidak valid, maskot tampil sehat dengan catatan bahwa kondisi udara belum diketahui. Gelembung sensor serta animasi tangan pada pose sapaan memakai aset lama. Maskot berwarna amber saat waspada dan koral saat bahaya, termasuk ketika menyapa.
- Header chat menampilkan status saat jawaban sedang disiapkan. Warna kondisi tetap pada ilustrasi dan balon dialog.
- Formulir daftar menyimpan detail profil sebagai bagian opsional. Halaman status email membedakan tautan kosong, gagal, dan berhasil.
- Build dan 119 tes lulus. Langkah berikutnya: uji email konfirmasi sungguhan dan tampilan di perangkat setelah rilis.

## AERO-BOT (status terbaru)

AERO-BOT bangun sendiri saat ada orang di depannya, menyapa dengan suara, lalu langsung bisa
diajak bicara. Tanpa orang, robot tidur (animasi tidur), sementara kedua layar tetap menyala.

### Komponen

| Bagian | Lokasi | Tugas |
|---|---|---|
| Program kamera | `aerobot-vision/` (Python, mini PC) | Deteksi orang (YOLOv8 + tracking), kirim `POST /presence` ke hub |
| Hub lokal | `robot-display/start.mjs` (Node 22, mini PC, `AEROBOT_PRESENCE=camera`) | Memutuskan bangun/tidur, menyiarkan `GET /presence/events` |
| Layar dada (bawah) | Chrome kiosk di mini PC: `https://aerosense.me/aerobot`, akun robot | Mode suara, sapaan, tanya-jawab, teruskan wake/sleep ke wajah |
| Layar wajah (atas) | Tablet: `https://aerosense.me/robot-screen`, akun robot yang sama | Animasi wajah: bangun, tidur, gerak mulut |
| API + web | Server lab, deploy `bash scripts/deploy-robot-screen.sh` | Relay wajah, suara (STT/TTS Gemini), antrean tanya-jawab |
| n8n | Control Center → "Jawaban website" | Jawaban Gemini berisi data sensor, cuaca, dan lingkungan |

### Alur

```
kamera --POST /presence--> hub start.mjs --GET /presence/events--> layar dada /aerobot
                                                                     |-- wajah tablet (lewat API relay)
                                                                     |-- mode suara + sapaan
pertanyaan pengunjung --> API --> n8n "Jawaban website" --> Gemini --> jawaban + suara /aerobot
```

1. Orang berdiri dekat dan di tengah kamera sekitar 1 detik, lalu hub mengirim `robot_wake`.
2. Layar dada mengirim `wake` ke wajah tablet (animasi bangun), menyalakan mode suara, lalu
   mengucapkan sapaan pendek tanpa data:
   "Halo halo! Aku AERO-BOT. Kalau kamu punya pertanyaan tentang lingkungan, tanya aku ya!"
   Suaranya sama dengan `/aerobot` (Gemini TTS, `GEMINI_TTS_VOICE`), mulut wajah ikut bergerak.
3. Setelah sapaan, robot langsung mendengarkan tanpa perlu "Halo AERO-BOT". Pertanyaan berikutnya
   memakai "Halo AERO-BOT" seperti biasa.
4. Pertanyaan dijawab workflow n8n "Jawaban website" (Gemini dengan konteks sensor dan cuaca).
5. Tanpa orang 5 detik (`AEROBOT_SLEEP_AFTER_MS=5000`): hub mengirim `robot_sleep`, mode suara
   mati, wajah memutar animasi tidur. Kamera tetap siaga.
6. Satu sapaan per bangun. Orang yang datang setelah robot tidur disapa lagi. Reload halaman
   tidak menyapa ulang (hub mengirim `robot_state` saat tersambung).

### Keputusan tim

- Saat tidur, layar dada dan layar wajah tetap menyala; tidur hanya ditunjukkan animasi tidur.
  Program kamera memakai `display_control: keep_on` dan menahan PC agar tidak sleep. Hub memakai
  `AEROBOT_DARK_WHEN_ASLEEP=0` sehingga halaman lokal `/` dan `/body` juga tidak menggelap.
- Sapaan saat ada orang adalah kalimat tetap yang pendek; data lingkungan hanya saat ditanya.
- Robot tidur setelah 5 detik tanpa orang (untuk demo). Bisa dinaikkan, misalnya 15000 = 15 detik.

### Menjalankan di mini PC

Sekali saja: Node.js 22, Python dengan venv di `aerobot-vision/`
(`python -m venv venv`, lalu `venv/Scripts/python.exe -m pip install -r requirements.txt`).
Windows: Settings → Power → Screen dan Sleep saat dicolok = Never.

Jalankan `aerobot-vision/scripts/start_robot.bat` (hub → kamera → Chrome kiosk). Pertama kali
dengan `set SETUP=1`: login akun robot, izinkan mikrofon dan "akses jaringan lokal". Manual:

```bash
cd robot-display && AEROBOT_PRESENCE=camera AEROBOT_SLEEP_AFTER_MS=5000 node start.mjs
cd aerobot-vision && ./venv/Scripts/python.exe -m aerobot_vision --config config.yaml --show
```

Urutan: hub dulu, lalu kamera, lalu Chrome. Tablet: buka `/robot-screen`, ketuk "Aktifkan wajah"
sekali; tanpa orang wajah tidur dalam 5 detik dan bangun saat kamera melihat orang.

Tanda berhasil: hub mencetak `Chest screen stream: ...`, kamera mencetak `Tersambung ke hub
robot-display`, judul chat `/aerobot` menampilkan "kamera tersambung".

### Pengaturan

| Pengaturan | Tempat | Nilai sekarang |
|---|---|---|
| `AEROBOT_PRESENCE` | env hub | `camera` |
| `AEROBOT_SLEEP_AFTER_MS` | env hub | `5000` (5 detik tanpa orang) |
| `AEROBOT_CHAT_URL` | env hub | `https://aerosense.me/aerobot` (halaman yang boleh mendengar hub) |
| `AEROBOT_DARK_WHEN_ASLEEP` | env hub | `0` (layar tetap menyala) |
| `source` | `aerobot-vision/config.yaml` | indeks webcam (`1` untuk webcam USB di laptop uji) |
| `robot.mode` | `aerobot-vision/config.yaml` | `hub` |
| `robot.display_control` | `aerobot-vision/config.yaml` | `keep_on` (`auto` = monitor standby, `off` = tidak disentuh) |
| `robot_display.url` | `aerobot-vision/config.yaml` | `http://127.0.0.1:4210/presence` (wajib `127.0.0.1`) |
| `behavior.near_ratio` | `aerobot-vision/config.yaml` | `0.45` (seberapa dekat orang dianggap hadir) |

### Catatan teknis

- Layar dada harus dibuka di komputer yang sama dengan hub dan kamera: halaman memanggil
  `http://127.0.0.1:4210`. Chrome meminta izin "akses jaringan lokal" sekali; hub menjawab
  preflight-nya.
- Selama layar dada tersambung, hub tidak mengirim `presence` ke API, jadi workflow n8n "AERO-BOT"
  (suara Kore) tidak ikut menyapa. Jalur itu tetap dipakai bila layar dada tidak tersambung.
- Workflow n8n tidak diubah. Di "Jawaban website", job bertanda `presence` memakai rute data
  langsung tanpa Gemini; layar dada tidak memakai rute itu.
- Relay wajah menyimpan `wake`/`sleep` terakhir per akun dan robot, lalu mengirimkannya ke tablet
  yang baru tersambung.
- Windows yang memblokir DLL `lap` (Application Control): program kamera otomatis memakai
  SimpleTracker. Model `.pt` terunduh otomatis; file model dan `venv` tidak disimpan di git.
- `deploy-robot-screen.sh` kadang berakhir dengan `curl: (52)` atau `(56)` karena nginx belum siap;
  cek ulang dengan `curl -s http://127.0.0.1:8082/api/health`.

### Pengujian

- `pnpm test` (API, relay, suara), `pnpm build`, `cd robot-display && node --test presence.test.mjs adapter.test.mjs`.
- `cd aerobot-vision && python -m pytest tests -q`.
- `robot-display/live-browser.test.mjs` hanya berjalan di Windows dengan Chrome terpasang.

## Berikutnya

1. Uji di mini PC dan tablet sungguhan dengan pengunjung; setel `behavior.near_ratio` dan
   `AEROBOT_SLEEP_AFTER_MS` sesuai lokasi.
2. Opsional: tablet tanpa ketukan saat start-up (kiosk browser yang mengizinkan audio otomatis).
3. Opsional: perbaiki health check di `deploy-robot-screen.sh` dengan `--retry-all-errors`.
