# AEROSENSE

## AERO-BOT

- Pengendali lokal menerima `POST /presence` dengan JSON `{"detected":true}` atau `{"detected":false}` saat `AEROBOT_PRESENCE=camera`. Kirim status dari frame yang valid setiap detik. Jeda data yang panjang dianggap putus kamera.
- Layar wajah ada di `/`. Layar dada ada di `/body` dan membuka dasbor dari `AEROBOT_DASHBOARD_URL`. Keduanya kembali gelap setelah lima menit tanpa orang. Ucapan yang sedang berlangsung menunda tidur.
- Satu event `presence` dikirim ke API per bangun jika identitas robot terpasang. Aturan jeda salam dan mode hening tetap di backend. `AEROBOT_OFFLINE=1` menjalankan percobaan lokal.
- Verifikasi laptop: kedua layar mengikuti deteksi simulasi di Chrome. Durasi lima menit diuji dengan jam simulasi. Alur salam diuji dengan API lokal pengganti.

### Layar dada + wajah tablet (alur gabungan)

1. Program kamera `aerobot_vision` (mini PC) mengirim `POST /presence` ke pengendali lokal ini.
2. Pengendali memutuskan bangun/tidur dan menyiarkan `GET /presence/events`
   (`robot_state`, `robot_wake {greet}`, `robot_sleep`) ke halaman dada `AEROBOT_CHAT_URL`.
3. Halaman dada `/aerobot` (akun robot, Chrome kiosk) saat `robot_wake`: kirim `wake` ke wajah
   tablet `/robot-screen`, nyalakan mode suara, minta sapaan ke workflow n8n (`/v1/chat` dengan
   `presence: true`; teks instruksi tetap di server) lalu ucapkan dengan suara `/aerobot` dan
   langsung mendengarkan tanpa "Halo AERO-BOT". Satu sapaan per bangun.
4. `robot_sleep` (lima menit tanpa orang): mode suara mati, wajah tidur, lalu program kamera
   mematikan monitor dada (standby Windows) setelah animasi tidur.
5. Selama halaman dada tersambung, event `presence` tidak dikirim ke API agar tidak menyapa dua kali.

## Berikutnya

1. Hubungkan output program kamera di mini PC ke endpoint lokal dan jalankan uji dengan orang sungguhan.
2. Tentukan cara mengakses layar wajah dari tablet dan mengendalikan daya panel sesuai perangkat.
3. Uji salam dengan perangkat terdaftar dan data lingkungan live.
