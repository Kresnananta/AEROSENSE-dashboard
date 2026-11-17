# AEROSENSE

## AERO-BOT

- Pengendali lokal menerima `POST /presence` dengan JSON `{"detected":true}` atau `{"detected":false}` saat `AEROBOT_PRESENCE=camera`. Kirim status dari frame yang valid setiap detik. Jeda data yang panjang dianggap putus kamera.
- Layar wajah ada di `/`. Layar dada ada di `/body` dan membuka dasbor dari `AEROBOT_DASHBOARD_URL`. Keduanya kembali gelap setelah lima menit tanpa orang. Ucapan yang sedang berlangsung menunda tidur.
- Satu event `presence` dikirim ke API per bangun jika identitas robot terpasang. Aturan jeda salam dan mode hening tetap di backend. `AEROBOT_OFFLINE=1` menjalankan percobaan lokal.
- Verifikasi laptop: kedua layar mengikuti deteksi simulasi di Chrome. Durasi lima menit diuji dengan jam simulasi. Alur salam diuji dengan API lokal pengganti.

### Layar dada + wajah tablet (alur gabungan)

1. Program kamera `aerobot-vision/` (Python, mini PC) mengirim `POST /presence` ke pengendali lokal ini.
   Jalankan semuanya dengan `aerobot-vision/scripts/start_robot.bat`.
2. Pengendali memutuskan bangun/tidur dan menyiarkan `GET /presence/events`
   (`robot_state`, `robot_wake {greet}`, `robot_sleep`) ke halaman dada `AEROBOT_CHAT_URL`.
3. Halaman dada `/aerobot` (akun robot, Chrome kiosk) saat `robot_wake`: kirim `wake` ke wajah
   tablet `/robot-screen`, nyalakan mode suara, ucapkan sapaan pendek tanpa data
   ("Halo halo! Aku AERO-BOT. Kalau kamu punya pertanyaan tentang lingkungan, tanya aku ya!")
   dengan suara `/aerobot`, lalu langsung mendengarkan tanpa "Halo AERO-BOT". Kondisi lingkungan
   dijawab Gemini lewat workflow saat pengunjung bertanya. Satu sapaan per bangun.
6. Wajah tablet: setelah "Aktifkan wajah" ditekan, relay mengirim status bangun/tidur terakhir;
   tanpa orang wajah tidur dalam 5 detik. Hub di mini PC memakai `AEROBOT_SLEEP_AFTER_MS=5000`,
   monitor dada mati 5 menit setelah robot tidur.
4. `robot_sleep` (lima menit tanpa orang): mode suara mati, wajah tidur, lalu program kamera
   mematikan monitor dada (standby Windows) setelah animasi tidur.
5. Selama halaman dada tersambung, event `presence` tidak dikirim ke API agar tidak menyapa dua kali.

## Berikutnya

1. Hubungkan output program kamera di mini PC ke endpoint lokal dan jalankan uji dengan orang sungguhan.
2. Tentukan cara mengakses layar wajah dari tablet dan mengendalikan daya panel sesuai perangkat.
3. Uji salam dengan perangkat terdaftar dan data lingkungan live.
