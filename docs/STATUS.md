# AEROSENSE — Status

## Tampilan web

Branch fix memuat pembaruan web, API, dan integrasi AERO-BOT terbaru untuk ditinjau dan diuji bersama.

- Halaman utama dan alur akun memakai ilustrasi lanskap pesisir Jawa Timur. Lanskap beranda memudar ke bagian fitur. Cahaya lembut di belakang maskot memperjelas siluetnya. Status cuaca tetap disampaikan lewat data dan ilustrasi kondisi pada Hub Lingkungan.

- Judul beranda mengenalkan udara dan lingkungan sekitar. Beranda menautkan pembacaan sensor, prakiraan, peringatan, dan AERO-BOT langsung dari daftar fitur. Tautan navigasi desktop tampil langsung di atas langit. Tombol masuk berbentuk pil, dan menu ponsel terbuka di atas panel solid.
- Ikon cuaca, kejadian, navigasi, dan formulir memakai set AEROSENSE dengan bidang dan ketebalan garis yang konsisten. Legenda peta memakai bentuk yang sama dengan ikon Hub. Beranda, navigasi, dan halaman akun memakai tanda merek yang sama.
- Prakiraan berbagi permintaan untuk titik yang sama. Saat penyedia membatasi permintaan, API menunggu sebelum mencoba lagi dan dapat menampilkan prakiraan tersimpan hingga enam jam dengan waktu sumber yang jelas. Rilis memerlukan pembaruan API dan web.
- Lapisan peta memakai satu kumpulan titik untuk cuaca dan satu untuk kualitas udara. Peta memakai ulang titik yang sama saat pengguna bergeser atau mengganti lapisan. Batas muatan peta menyisakan kuota Open-Meteo untuk prakiraan dan Hub.
- Saat prakiraan per jam belum tersedia, Hub memakai prakiraan harian tersimpan yang masih berlaku untuk node acuan. Status dan tanggal prakiraan ditulis terpisah dari kondisi saat ini.
- Kobalt dan hijau limau dipakai untuk identitas antarmuka. Limau menyorot tindakan utama serta hover pada navigasi, daftar fitur, dan saran chat dan kobalt menandai navigasi aktif. Amber dan merah dipakai untuk status peringatan. Panel transparan kembali solid pada pengaturan kontras tinggi.
- Cara kerja menampilkan tiga langkah dalam satu baris di desktop dan bertumpuk di ponsel. Area pengantar fokus pada judul dan deskripsi.
- Di ponsel, kategori Hub Lingkungan tersedia lewat menu Topik. Suhu, kelembapan, dan angin tampil dalam baris dengan angka dan satuan sejajar. Chat memakai lebih banyak ruang layar, dengan panel maskot tersedia di layar lebar. Kartu prakiraan hari ini menumpuk ilustrasi, teks, dan statistik agar teks mendapat lebar penuh.
- Judul dan tindakan halaman memakai jarak yang konsisten dan dapat membungkus di layar sempit. Navigasi dasbor menyediakan tautan lewati ke konten utama untuk keyboard. Notis pembaruan prakiraan memakai limau.
- Ringkasan menampilkan pembacaan sensor dan satu ringkasan wilayah. Prakiraan lengkap dan Kabar Bencana tersedia di Cuaca & lingkungan. Menu Data & perangkat membuka riwayat, perangkat, dan fungsi pengelolaan sesuai hak akses.
- Amber dipakai untuk cuaca dan Waspada. Merah dipakai untuk peringatan sensor dan Bahaya. Navigasi, daftar fitur, dan Ringkasan diperiksa di Chrome pada lebar 320, 390, 768, dan 1440 px. Warna status diuji dengan data contoh.
- Gradasi biru dan batas alfa dipakai di beranda, dasbor, Hub Lingkungan, AERO-BOT, dan alur akun. Langit dan garis kontur dipakai di sekitar panel fitur, prakiraan, dan peta. Legenda, kontrol lokasi, dan pop-up peta memakai permukaan kaca dengan cadangan solid. Warna skala model tetap melekat pada data peta.
- Tampilan diperiksa di Chrome pada lebar 390 dan 1440 px. Pemeriksaan mencakup menu beranda, formulir akun, chat, kelola kawasan, dialog prakiraan, dan pembacaan titik peta. Kontrol kembali solid dalam mode kontras tinggi.

- Kartu prakiraan per jam dan tujuh hari memakai proporsi potret dan ilustrasi yang lebih besar. Vinyet biru di tepi prakiraan, kategori Hub Lingkungan, dan daftar node muncul saat masih ada konten yang bisa digulir.
- Bilah gulir halaman, prakiraan cuaca, navigasi, chat, dan tabel memakai warna biru yang sama. Seret, navigasi Tab, sapuan ponsel, dan mode kontras tinggi diuji di Chrome.
- Judul utama dan angka prakiraan memakai biru yang lebih kuat. Bilah navigasi, menu, dan dialog menggunakan kaca yang lebih bening dengan cadangan solid untuk pengaturan aksesibilitas.
- Ilustrasi prakiraan diukur dari area gambar yang terlihat. Cerah malam memakai bulan, cerah berawan memakai bulan dan awan, dan kartu harian memakai kondisi harian.
- Area sambutan Tanya AERO-BOT memakai ilustrasi cuaca dan warna lembut sesuai topik saran.
- Latar kartu prakiraan mengikuti waktu WIB. Kartu siang memakai rona langit cerah, dan kartu malam memakai biru laut yang lebih dalam.
- Kabar Bencana menggabungkan liputan ANTARA dalam filter Gempa & longsor. Jenis kejadian, sumber, dan tautan tetap tampil pada setiap kartu. Ringkasan BMKG memakai latar polos agar angka mudah dibaca.
- BMKG menjadi rujukan parameter dan status tsunami. Kabar Bencana menautkan daftar resmi BMKG terpisah dari liputan ANTARA. Hub Lingkungan dan peta memakai daftar nasional M5,0+ dari halaman BMKG, hingga 30 kejadian. Ringkasan menampilkan tiga kejadian terbaru dan bisa dibuka untuk membaca sisanya. Peta mengelompokkan pin berdekatan saat diperbesar atau diperkecil dan membuka rincian setiap kejadian. Umpan JSON hingga 15 kejadian dipakai saat halaman BMKG gagal dibaca. AERO-BOT tetap memakai cakupan tujuh hari untuk jawaban lokasi. Siklon tetap ditampilkan dengan atribusi GDACS.
- Penanda memakai bentuk pin dengan warna penuh. Pin AEROSENSE biru memuat logo resmi dan pin WATERSENSE hijau kebiruan memakai tetes air. Gempa merah mawar dan titik panas jingga. Peta dan legenda memakai bentuk dan warna yang sama. Pin bergerak berulang selama disorot kursor dan mengikuti pengaturan pengurangan gerak.
- Label warna tampil pada zoom 11 ke atas. Zoom 8–10 menampilkan titik acuan kota atau kabupaten, sedangkan zoom 7 ke bawah menampilkan provinsi. Isi kotak mengikuti warna skala model dan teks menyesuaikan kontras. Jumlah dan jarak label menyesuaikan ukuran peta.
- Peta latar meredupkan detail jalan saat lapisan model aktif. Titik atau label dapat dipilih untuk melihat nilai, satuan, sumber, dan waktu estimasi. Label wilayah memakai koordinat titik acuannya saat dibuka, termasuk ketika posisi kotaknya bergeser.
- Peta memakai ulang hingga delapan area lapisan yang baru dimuat. Permintaan menunggu zoom selesai, dan lapisan terakhir beserta waktunya tetap tampil saat pembaruan gagal. Raster dibatasi hingga 720 × 520 piksel.
- Data wilayah berisi 38 provinsi dan 514 kota atau kabupaten. Titik acuan memakai koordinat pusat pemerintahan dari [dataset wilayah Indonesia](https://github.com/nekoding/wilayah-indonesia/tree/02bdc8fd3b06dcb6a393731509f6865b9bb4d8d3/data). Lisensi berada di `docs/REGION_DATA_LICENSE.txt`.
- Peta diuji di Chrome pada lebar 390 dan 1440 px dengan data model uji. Teks pada label berwarna mencapai rasio kontras 4,5:1. Pembacaan titik, label wilayah, klik ganda, loop hover, dan keyboard diperiksa. Pada tiap ukuran, 24 langkah zoom ulang memakai ulang data yang sudah dimuat. Lapisan dan waktu terakhir tetap terlihat saat layanan merespons 503. Pemeriksaan data model pada situs publik menunggu rilis web.
- Ringkasan siklon dan gempa memberi ruang terpisah untuk lokasi, waktu, kedalaman, dan catatan BMKG. Nama Maluku Barat Daya ditulis lengkap dan magnitudo tampil polos. Status tsunami diringkas hanya jika BMKG menyatakan semua gempa yang ditampilkan tidak berpotensi tsunami.
- Pin gempa menampilkan angka magnitudo dan lingkaran singkat saat dibuka. Ukuran lingkaran mengikuti magnitudo. Rincian peta dan ringkasan memakai format magnitudo, nama lokasi, dan waktu WIB yang sama. Status tsunami dan tautan BMKG tetap terlihat. Pin, data tersimpan, dan pengurangan gerak diuji di Chrome pada lebar 390 dan 1440 px.
- Landing, dasbor, Hub Lingkungan, chat, dan alur akun memakai permukaan dan kontrol yang seragam. Ilustrasi asli AEROSENSE dipakai untuk sensor, cuaca, kondisi lingkungan, dan maskot.
- Panel AERO-BOT menunjukkan ekspresi melalui balon dialog, waktu baca, dan saran untuk titik sensor yang dipakai chat. Jika data tidak valid, maskot tampil sehat dengan catatan bahwa kondisi udara belum diketahui. Gelembung sensor serta animasi tangan pada pose sapaan memakai aset lama. Maskot berwarna amber saat waspada dan koral saat bahaya, termasuk ketika menyapa.
- Tombol kirim AERO-BOT memakai ikon panah dengan label aksesibel.
- Balasan AERO-BOT memakai gelembung biru dan pesan pengguna memakai limau. Baris masuk dan acuan lokasi berbagi jarak tepi yang sama. Tautan WhatsApp berada di judul halaman.
- Header chat menampilkan status saat jawaban sedang disiapkan. Warna kondisi tetap pada ilustrasi dan balon dialog.
- Formulir daftar menyimpan detail profil sebagai bagian opsional. Peta mengikuti hasil pencarian yang dipilih dan muncul setelah alamat ditemukan. Alur pemilihan dan hasil kosong diuji di Chrome dengan data uji. Halaman status email membedakan tautan kosong, gagal, dan berhasil. Template konfirmasi di `server/supabase/confirmation-email.html` menunggu pemasangan di Supabase dan uji pengiriman.
- Build dan 128 tes lulus. Daftar nasional dan peta diuji dengan 30 kejadian dari BMKG, termasuk pilihan saat umpan cadangan digunakan. Penanda, navigasi keyboard, dan rujukan gempa diuji di Chrome pada lebar 390 dan 1440 px, termasuk saat umpan BMKG kosong atau gagal. Rilis API dan web diperlukan untuk daftar nasional. Periksa jumlah kejadian pada situs publik setelah rilis dan uji email konfirmasi.

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
