# Undangan Digital Modern - Ardan & Nayla, Banyak Jenis Acara

Demo undangan digital modern yang satu desainnya melayani empat jenis acara. Semua data fiktif. Harga tidak ditampilkan; untuk harga dan paket, calon klien diarahkan menghubungi Bagas.

## Tech Stack

- HTML5, CSS3 (`@property` untuk transisi warna), vanilla JavaScript, tanpa framework
- Skrip bersama: `../undangan-shared/core.js`
- Google Fonts (Bricolage Grotesque, Plus Jakarta Sans)

## Fitur

- Empat jenis acara: pernikahan, tunangan, ulang tahun, syukuran rumah. Ganti jenis acara, lalu warna (satu variabel hue), judul, jadwal, info, palet warna, ucapan, doa, dan teks hadiah ikut berubah. Pilihan tersimpan di `?acara=`
- Di desktop, poster acara menempel di kiri dan undangan selebar ponsel di kanan
- Sampul dengan kolom nama tamu yang bisa diketik langsung, atau diisi dari link `?to=Nama`
- Kartu tanggal gaya tiket, hitung mundur, pita teks berjalan, jadwal, peta ilustrasi, simpan ke kalender (.ics dengan pengingat sehari sebelumnya)
- Bagian ucapan dan doa untuk setiap jenis acara, plus doa untuk para tamu
- Galeri yang bisa digeser dengan jari, diseret mouse, atau tombol panah, dan diperbesar dengan lightbox
- Hadiah: transfer bank dengan tombol salin, dan contoh tampilan QRIS (bukan kode asli)
- Tiket masuk dengan nama tamu dan contoh kode QR
- RSVP dan dinding ucapan terpisah untuk tiap jenis acara, tersimpan di localStorage, dengan konfeti kecil saat memilih hadir
- Pembuat link personal untuk tiap tamu
- Dock navigasi bawah yang menandai bagian yang sedang dilihat, dan bilah progres gulir
- Musik latar yang dibuat langsung di browser (Web Audio)
- Mendukung `prefers-reduced-motion`; buka langsung tanpa sampul dengan `?buka`
