# Undangan Digital Klasik - Romeo & Juliet

Demo undangan pernikahan digital bergaya klasik. Semua data (nama, tempat, rekening, ucapan) fiktif. Harga tidak ditampilkan; untuk harga dan paket, calon klien diarahkan menghubungi Bagas.

## Tech Stack

- HTML5, CSS3, vanilla JavaScript, tanpa framework
- Skrip bersama: `../undangan-shared/core.js`
- Google Fonts (Cormorant Garamond, Great Vibes, Jost)

## Fitur

- Sampul amplop 3D yang terbuka saat segel lilin disentuh, dengan nama tamu di kartu
- Nama tamu dari link: `?to=Nama+Tamu`
- Hero berbingkai ornamen, kutipan, kartu mempelai, akad dan resepsi
- Tanggal acara bergulir otomatis (Sabtu pertama minimal 45 hari ke depan) sehingga hitung mundur selalu berjalan
- Simpan ke kalender (file .ics asli), tombol peta (simulasi)
- Kisah kami, galeri ilustrasi, amplop digital dengan tombol salin nomor
- RSVP dengan validasi dan dinding ucapan, tersimpan di localStorage browser
- Musik latar yang dibuat langsung di browser (Web Audio), tanpa berkas audio
- Mendukung `prefers-reduced-motion`; buka langsung tanpa sampul dengan `?buka` atau link bagian (`#rsvp`)
