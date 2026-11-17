# AEROSENSE

## AERO-BOT

- Pengendali lokal menerima `POST /presence` dengan JSON `{"detected":true}` atau `{"detected":false}` saat `AEROBOT_PRESENCE=camera`. Kirim status dari frame yang valid setiap detik. Jeda data yang panjang dianggap putus kamera.
- Layar wajah ada di `/`. Layar dada ada di `/body` dan membuka dasbor dari `AEROBOT_DASHBOARD_URL`. Keduanya kembali gelap setelah lima menit tanpa orang. Ucapan yang sedang berlangsung menunda tidur.
- Satu event `presence` dikirim ke API per bangun jika identitas robot terpasang. Aturan jeda salam dan mode hening tetap di backend. `AEROBOT_OFFLINE=1` menjalankan percobaan lokal.
- Verifikasi laptop: kedua layar mengikuti deteksi simulasi di Chrome. Durasi lima menit diuji dengan jam simulasi. Alur salam diuji dengan API lokal pengganti.

## Berikutnya

1. Hubungkan output program kamera di mini PC ke endpoint lokal dan jalankan uji dengan orang sungguhan.
2. Tentukan cara mengakses layar wajah dari tablet dan mengendalikan daya panel sesuai perangkat.
3. Uji salam dengan perangkat terdaftar dan data lingkungan live.
