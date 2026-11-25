// The three digital invitation demos, in English and Indonesian.
// All render through src/components/InvitationDemos.astro, on the home page and on the For business pages.
// Pricing is deliberately not shown anywhere: it depends on the features, so people are sent to contact Bagas.

export const invitationDemos = [
  { slug: 'undangan-klasik', href: '/demo/undangan-klasik/', image: '/demo/undangan-klasik/preview.jpg', width: 1100, height: 688 },
  { slug: 'undangan-modern', href: '/demo/undangan-modern/', image: '/demo/undangan-modern/preview.jpg', width: 1100, height: 688 },
  { slug: 'undangan-islami', href: '/demo/undangan-islami/', image: '/demo/undangan-islami/preview.jpg', width: 1100, height: 688 },
];

export const invitations = {
  en: {
    eyebrow: 'Digital invitations',
    title: 'Three invitation demos, three styles',
    lead: 'A digital invitation that guests open from a link, with their own name on the cover, a countdown, prayers and wishes, an RSVP form and more. Open all three on your phone and see which style fits your event. Pricing depends on the features you need, so contact Bagas.',
    open: 'Open demo',
    contact: 'Contact Bagas for pricing',
    cards: [
      {
        kind: 'Classic · Wedding',
        title: 'Ardan & Nayla, classic',
        text: 'An envelope that opens when you touch the wax seal. Script and serif type, gold ornaments, an opening greeting and prayers, an event rundown, a love story timeline, QR guest card, digital envelope, RSVP with a wishes wall, and a soft music loop.',
        tags: ['Opening envelope', 'Guest name from link', 'Countdown', 'Prayers and greetings', 'QR guest card', 'RSVP and wishes', 'Digital gift', 'Music'],
        alt: 'Preview of the classic wedding invitation: a cream envelope with a wine-red wax seal on a burgundy cover',
      },
      {
        kind: 'Modern · Any event',
        title: 'Ardan & Nayla, modern',
        text: 'One bold design for weddings, engagements, birthdays and housewarmings. Switch the event type and the colours, schedule, greetings and prayers change with it, which is how one design can serve many kinds of clients.',
        tags: ['4 event types', 'Swipe gallery', 'Prayers and greetings', 'QR entry ticket', 'Guest link generator', 'RSVP and wishes', 'Calendar file', 'Music'],
        alt: 'Preview of the modern invitation: a large orange poster beside a phone-width invitation with a ticket-style date card',
      },
      {
        kind: 'Islamic · Wedding',
        title: 'Ardan & Nayla, Islamic',
        text: 'An emerald and gold wedding invitation for Muslim families: gate doors that open, the Bismillah, a Qur\'anic verse and doa with transliteration and meaning, akad nikah and walimatul \'urs, a ta\'aruf story, QR guest card, digital gift, and a doa and wishes wall.',
        tags: ['Opening gates', 'Verse and doa', 'Akad and walimah', 'QR guest card', 'Doa and wishes', 'Digital gift', 'Share link'],
        alt: 'Preview of the Islamic wedding invitation: emerald gate doors with gold geometric patterns and the Bismillah in Arabic calligraphy',
      },
    ],
  },
  id: {
    eyebrow: 'Undangan digital',
    title: 'Tiga demo undangan, tiga gaya',
    lead: 'Undangan digital yang dibuka tamu lewat link, lengkap dengan nama mereka di sampul, hitung mundur, doa dan ucapan, form RSVP, dan lainnya. Buka ketiganya di ponsel dan lihat gaya mana yang cocok untuk acara Anda. Harga menyesuaikan fitur yang dibutuhkan, jadi silakan hubungi Bagas.',
    open: 'Buka demo',
    contact: 'Hubungi Bagas untuk harga',
    cards: [
      {
        kind: 'Klasik · Pernikahan',
        title: 'Ardan & Nayla, klasik',
        text: 'Amplop yang terbuka saat Anda menyentuh segel lilinnya. Huruf sambung dan serif, ornamen emas, salam pembuka dan doa, susunan acara, linimasa kisah cinta, kartu tamu QR, amplop digital, RSVP dengan dinding ucapan, dan musik lembut.',
        tags: ['Amplop terbuka', 'Nama tamu dari link', 'Hitung mundur', 'Doa dan ucapan', 'Kartu tamu QR', 'RSVP dan ucapan', 'Hadiah digital', 'Musik'],
        alt: 'Pratinjau undangan pernikahan klasik: amplop krem dengan segel lilin merah anggur di atas sampul burgundy',
      },
      {
        kind: 'Modern · Semua acara',
        title: 'Ardan & Nayla, modern',
        text: 'Satu desain tegas untuk pernikahan, tunangan, ulang tahun, dan syukuran rumah. Ganti jenis acara, lalu warna, jadwal, ucapan, dan doanya ikut berubah, sehingga satu desain bisa melayani banyak jenis klien.',
        tags: ['4 jenis acara', 'Galeri geser', 'Doa dan ucapan', 'Tiket masuk QR', 'Pembuat link tamu', 'RSVP dan ucapan', 'File kalender', 'Musik'],
        alt: 'Pratinjau undangan modern: poster oranye besar di samping undangan selebar ponsel dengan kartu tanggal bergaya tiket',
      },
      {
        kind: 'Islami · Pernikahan',
        title: 'Ardan & Nayla, islami',
        text: 'Undangan pernikahan hijau zamrud dan emas untuk keluarga muslim: pintu gerbang yang terbuka, basmalah, ayat dan doa lengkap dengan transliterasi dan artinya, akad nikah dan walimatul \'urs, kisah ta\'aruf, kartu tamu QR, hadiah digital, serta dinding doa dan ucapan.',
        tags: ['Gerbang terbuka', 'Ayat dan doa', 'Akad dan walimah', 'Kartu tamu QR', 'Doa dan ucapan', 'Hadiah digital', 'Bagikan link'],
        alt: 'Pratinjau undangan pernikahan islami: pintu gerbang hijau zamrud dengan pola geometris emas dan basmalah dalam kaligrafi Arab',
      },
    ],
  },
};
