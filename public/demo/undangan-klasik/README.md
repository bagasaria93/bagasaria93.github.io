# Undangan Digital Klasik - Ardan & Nayla

Demo undangan pernikahan digital bergaya klasik. Semua data (nama, tempat, rekening, ucapan) fiktif. Harga tidak ditampilkan; untuk harga dan paket, calon klien diarahkan menghubungi Bagas.

## Tech Stack

- HTML5, CSS3, vanilla JavaScript, tanpa framework
- Skrip bersama: `../undangan-shared/core.js`
- Google Fonts (Cormorant Garamond, Great Vibes, Jost)

## Fitur

- Sampul amplop 3D yang terbuka saat segel lilin disentuh, dengan nama tamu di kartu dan debu emas yang melayang
- Nama tamu dari link: `?to=Nama+Tamu` (tanpa link, tertulis "Bapak/Ibu/Saudara/i")
- Hero berbingkai ornamen dengan nama berefek foil emas dan kelopak yang jatuh perlahan
- Salam pembuka, doa untuk kedua mempelai, doa untuk para tamu, dan ucapan terima kasih di penutup
- Kartu mempelai, akad dan resepsi, susunan acara per jam, informasi tamu (tiba lebih awal, parkir, foto bersama)
- Tanggal acara bergulir otomatis (Sabtu pertama minimal 45 hari ke depan) sehingga hitung mundur selalu berjalan
- Simpan ke kalender (file .ics asli dengan pengingat sehari sebelumnya), tombol peta (simulasi)
- Kisah kami, galeri ilustrasi yang bisa diperbesar (lightbox, mendukung keyboard), amplop digital dengan tombol salin nomor
- Kartu tamu dengan contoh kode QR (bukan kode asli)
- RSVP dengan validasi dan dinding ucapan, tersimpan di localStorage browser, dengan konfeti kecil saat memilih hadir
- Musik latar yang dibuat langsung di browser (Web Audio), tanpa berkas audio
- Menu atas di desktop, bilah progres gulir, dan tombol bagikan undangan
- Mendukung `prefers-reduced-motion`; buka langsung tanpa sampul dengan `?buka` atau link bagian (`#rsvp`)
