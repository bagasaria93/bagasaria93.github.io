# Undangan Digital Modern - Romeo & Juliet, Banyak Jenis Acara

Demo undangan digital modern yang satu desainnya melayani empat jenis acara. Semua data fiktif. Harga tidak ditampilkan; untuk harga dan paket, calon klien diarahkan menghubungi Bagas.

## Tech Stack

- HTML5, CSS3 (`@property` untuk transisi warna), vanilla JavaScript, tanpa framework
- Skrip bersama: `../undangan-shared/core.js`
- Google Fonts (Bricolage Grotesque, Plus Jakarta Sans)

## Fitur

- Empat jenis acara: pernikahan, tunangan, ulang tahun, syukuran rumah. Ganti jenis acara, lalu warna (satu variabel hue), judul, jadwal, info, teks hadiah, dan ucapan ikut berubah. Pilihan tersimpan di `?acara=`
- Di desktop, poster acara menempel di kiri dan undangan selebar ponsel di kanan
- Sampul dengan kolom nama tamu yang bisa diketik langsung, atau diisi dari link `?to=Nama`
- Kartu tanggal gaya tiket, hitung mundur, jadwal, peta ilustrasi, simpan ke kalender (.ics)
- Galeri yang bisa digeser dengan jari, diseret mouse, atau tombol panah
- Hadiah: transfer bank dengan tombol salin, dan contoh tampilan QRIS (bukan kode asli)
- RSVP dan dinding ucapan terpisah untuk tiap jenis acara, tersimpan di localStorage
- Pembuat link personal untuk tiap tamu
- Dock navigasi bawah yang menandai bagian yang sedang dilihat
- Musik latar yang dibuat langsung di browser (Web Audio)
- Mendukung `prefers-reduced-motion`; buka langsung tanpa sampul dengan `?buka`
