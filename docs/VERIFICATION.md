# Hasil pemeriksaan integrasi

Pemeriksaan pada 16 Oktober 2026.

## Lulus

- Build TypeScript dan Vite.
- Delapan pengujian Node: autentikasi perangkat, batas akses node, idempotensi job, signature Meta, validasi telemetry, lease, respons model, format audio, konfigurasi publik, pemisahan cache berdasarkan koordinat dan hasil chat milik akun.
- Lint pada source baru dan yang diubah. Lint seluruh repositori menyisakan empat peringatan Fast Refresh pada komponen bawaan yang tidak diubah.
- Pemeriksaan desain otomatis pada hub, chat, workspace sensor dan stylesheet tidak menemukan masalah.
- Uji browser lokal: login, kategori cuaca/udara, kondisi sensor tanpa pembacaan, serta pertanyaan yang menghasilkan job dan jawaban.
- Pemeriksaan desktop dan ponsel. Overflow header ponsel diperbaiki; pemeriksaan berikutnya tidak menemukan overflow horizontal.
- Bundle frontend tidak mengandung credential pengujian server.

## Batas pengujian

Uji browser menggunakan server fixture lokal dan data sintetis. Jawaban pada pengujian tersebut bukan panggilan Gemini langsung. Pengujian HTTP memeriksa kontrak backend dengan Supabase pengujian dalam proses, bukan database produksi.

Docker Desktop lokal tidak berjalan. Image Docker, resolusi hostname aerosense-api pada network server, proxy nginx, Cloudflare Tunnel, dan login Supabase produksi perlu diuji pada server.

Perubahan ini belum dipasang pada aerosense.me. Tidak ada credential produksi yang dimasukkan ke repositori. Tidak ada perubahan koordinat node sensor atau pengisian data contoh ke database produksi.

Perangkat infrared, mikrofon, speaker, agent mini PC, dan pengiriman WhatsApp memerlukan uji perangkat serta credential masing-masing. Hub publik masih bergantung pada ketersediaan penyedia: IQAir menunggu key, BMKG cuaca menunggu kode kelurahan, dan REST SoilGrids sedang dihentikan sementara.
