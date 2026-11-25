# Undangan Digital Islami - Walimatul 'Urs Ardan & Nayla

Demo undangan pernikahan digital bernuansa islami, lengkap dengan ayat, doa, dan ucapan. Semua data (nama, tempat, rekening, ucapan) fiktif. Harga tidak ditampilkan; untuk harga dan paket, calon klien diarahkan menghubungi Bagas.

## Tech Stack

- HTML5, CSS3, vanilla JavaScript, tanpa framework
- Skrip bersama: `../undangan-shared/core.js`
- Google Fonts (Amiri untuk teks Arab, Cormorant Garamond, Great Vibes, Jost)

## Fitur

- Sampul berupa pintu gerbang berpola bintang delapan yang terbuka saat tombol ditekan, dengan nama tamu dari link: `?to=Nama+Tamu`
- Bismillah, salam, ucapan pembuka, dan QS. Ar-Rum (30): 21 dengan teks Arab, transliterasi, dan terjemahan
- Kartu mempelai berbingkai lengkung mihrab, lengkap dengan nama orang tua
- Akad nikah dan walimatul 'urs dengan jadwal yang bergulir otomatis (Sabtu pertama minimal 45 hari ke depan), sehingga hitung mundur selalu berjalan
- Simpan ke kalender (file .ics asli dengan pengingat sehari sebelumnya), tombol peta (simulasi)
- Kisah ta'aruf contoh, galeri ilustrasi geometris yang bisa diperbesar (lightbox, mendukung keyboard)
- Amplop digital dengan tombol salin nomor rekening dan contoh tampilan QRIS (bukan kode asli)
- Kartu tamu dengan contoh kode QR untuk registrasi di lokasi
- Doa untuk kedua mempelai (Barakallahu laka dan QS. Al-Furqan (25): 74) beserta dinding doa dan ucapan
- RSVP dengan validasi, tersimpan di localStorage browser, dan konfeti kecil saat memilih hadir
- Penutup dengan ucapan terima kasih, wassalam, tombol bagikan, dan ajakan menghubungi Bagas
- Tanpa musik. Mendukung `prefers-reduced-motion`; buka langsung tanpa sampul dengan `?buka` atau link bagian (`#rsvp`)
