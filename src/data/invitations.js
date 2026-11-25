// The two digital invitation demos, in English and Indonesian.
// Both render through src/components/InvitationDemos.astro, on the home page and on the For business pages.
// Pricing is deliberately not shown anywhere: it depends on the features, so people are sent to contact Bagas.

export const invitationDemos = [
  { slug: 'undangan-klasik', href: '/demo/undangan-klasik/', image: '/demo/undangan-klasik/preview.jpg', width: 1100, height: 688 },
  { slug: 'undangan-modern', href: '/demo/undangan-modern/', image: '/demo/undangan-modern/preview.jpg', width: 1100, height: 688 },
];

export const invitations = {
  en: {
    eyebrow: 'Digital invitations',
    title: 'Two invitation demos, two styles',
    lead: 'A digital invitation that guests open from a link, with their own name on the cover, a countdown, an RSVP form and more. Open both on your phone and see which style fits your event. Pricing depends on the features you need, so contact Bagas.',
    open: 'Open demo',
    contact: 'Contact Bagas for pricing',
    cards: [
      {
        kind: 'Classic · Wedding',
        title: 'Romeo & Juliet, classic',
        text: 'An envelope that opens when you touch the wax seal. Script and serif type, gold ornaments, a love story timeline, digital envelope, RSVP with a wishes wall, and a soft music loop.',
        tags: ['Opening envelope', 'Guest name from link', 'Countdown', 'Save to calendar', 'RSVP and wishes', 'Digital gift', 'Music'],
        alt: 'Preview of the classic wedding invitation: a cream envelope with a wine-red wax seal on a burgundy cover',
      },
      {
        kind: 'Modern · Any event',
        title: 'Romeo & Juliet, modern',
        text: 'One bold design for weddings, engagements, birthdays and housewarmings. Switch the event type and the colours, schedule and wording change with it, which is how one design can serve many kinds of clients.',
        tags: ['4 event types', 'Swipe gallery', 'Guest link generator', 'QRIS-style gift', 'RSVP and wishes', 'Calendar file', 'Music'],
        alt: 'Preview of the modern invitation: a large orange poster beside a phone-width invitation with a ticket-style date card',
      },
    ],
  },
  id: {
    eyebrow: 'Undangan digital',
    title: 'Dua demo undangan, dua gaya',
    lead: 'Undangan digital yang dibuka tamu lewat link, lengkap dengan nama mereka di sampul, hitung mundur, form RSVP, dan lainnya. Buka keduanya di ponsel dan lihat gaya mana yang cocok untuk acara Anda. Harga menyesuaikan fitur yang dibutuhkan, jadi silakan hubungi Bagas.',
    open: 'Buka demo',
    contact: 'Hubungi Bagas untuk harga',
    cards: [
      {
        kind: 'Klasik · Pernikahan',
        title: 'Romeo & Juliet, klasik',
        text: 'Amplop yang terbuka saat Anda menyentuh segel lilinnya. Huruf sambung dan serif, ornamen emas, linimasa kisah cinta, amplop digital, RSVP dengan dinding ucapan, dan musik lembut.',
        tags: ['Amplop terbuka', 'Nama tamu dari link', 'Hitung mundur', 'Simpan ke kalender', 'RSVP dan ucapan', 'Hadiah digital', 'Musik'],
        alt: 'Pratinjau undangan pernikahan klasik: amplop krem dengan segel lilin merah anggur di atas sampul burgundy',
      },
      {
        kind: 'Modern · Semua acara',
        title: 'Romeo & Juliet, modern',
        text: 'Satu desain tegas untuk pernikahan, tunangan, ulang tahun, dan syukuran rumah. Ganti jenis acara, lalu warna, jadwal, dan kalimatnya ikut berubah, sehingga satu desain bisa melayani banyak jenis klien.',
        tags: ['4 jenis acara', 'Galeri geser', 'Pembuat link tamu', 'Hadiah gaya QRIS', 'RSVP dan ucapan', 'File kalender', 'Musik'],
        alt: 'Pratinjau undangan modern: poster oranye besar di samping undangan selebar ponsel dengan kartu tanggal bergaya tiket',
      },
    ],
  },
};
