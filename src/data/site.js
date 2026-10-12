// Single source of truth for every fact shown on the site. Each entry was checked against
// the CV fact sheet agreed with the owner on 11 Oct 2026. Do not add numbers that are not verified.

export const profile = {
  name: 'Bagas Aria Sativa',
  role: 'Full-Stack Developer',
  location: 'Bekasi, Indonesia',
  email: 'bagasativa@gmail.com',
  phone: '+62 812-5555-7994',
  whatsapp: 'https://wa.me/6281255557994',
  linkedin: 'https://www.linkedin.com/in/bagasaria',
  github: 'https://github.com/bagasaria93',
  site: 'https://bagasaria93.github.io',
  cv: '/assets/CV_Bagas_Aria_Sativa.pdf',
};

export const stats = [
  { value: 19, suffix: '', label: 'projects you can open' },
  { value: 4, suffix: '', label: 'programming languages' },
  { value: 2, suffix: '', label: 'companies, systems in production' },
  { value: 1, suffix: '+', label: 'year of professional work' },
];

export const ticker = [
  'Laravel', 'PHP', 'MySQL', 'JavaScript', 'TypeScript', 'REST API', 'OAuth 2.0',
  'Accurate Online API', 'Next.js', 'React', 'Tailwind CSS', 'PostgreSQL', 'Git',
];

export const experience = [
  {
    title: 'Full-Stack Developer',
    org: 'PT Ganzu Gisma Seiko',
    meta: 'Hybrid / Manufacturing ERP and business systems',
    period: 'Aug 2025 to Present',
    stack: 'Laravel 10, PHP, MySQL, Bootstrap, jQuery, ApexCharts, Accurate Online API, Hostinger',
    points: [
      'Sole developer of a manufacturing ERP built from scratch and in daily use, covering Sales, Procurement, Warehouse, PPC and MRP, Production, QC, Delivery, Finance, HRD, Production Engineering, Maintenance and General Affairs.',
      'Designed role-based access control with 30+ roles across staff, supervisor and manager tiers, with department-specific multi-level approval workflows.',
      'Integrated the ERP with Accurate Online (OAuth 2.0, REST API): documents are validated against the accounting master data, sent in a single attempt that is never retried automatically when the result is uncertain, and read back to verify amounts.',
      'Built an MRP engine that turns sales orders and bills of materials into raw material requirements and purchase requests that follow the approval workflow.',
    ],
  },
  {
    title: 'Full-Stack Developer (Project-Based)',
    org: 'Rainbrow Sulam Alis',
    meta: 'Aftercare, booking and HR systems',
    period: 'Jan 2025 to Oct 2025',
    stack: 'CodeIgniter 3, PHP, MySQL, Bootstrap, Tailwind CSS, jQuery, Chart.js, WhatsApp click-to-chat, Hostinger',
    points: [
      'Built three business applications end to end as the only developer, in parallel, all completed ahead of schedule, with the HR Supervisor guiding the business processes.',
      'Aftercare, the largest: customer ratings with tokenised links, low-rating follow-up with vouchers and proof, Google rating tracking, a daily reminder job, retouch and reschedule handling, and an inventory chain from purchasing to branch delivery, with nine user roles.',
      'NailShade: QR booking and walk-in registration, a customer points program with tiers, vouchers and redemption, barcode scanning for nail artists, and a nail artist leaderboard used for monthly commission.',
      'Rainbrow Career Path: an HRIS with employee management, GPS-based attendance, leave, payroll and performance, built around training and recruitment.',
    ],
  },
  {
    title: 'IT Support Intern',
    org: 'PT Komatsu Undercarriage Indonesia',
    meta: 'On-site / Heavy industry',
    period: 'Nov 2023 to Jan 2024',
    stack: 'Alpha Anywhere, SQL',
    points: [
      'Implemented form logic and data binding for the Delivery Note module.',
      'Designed a web-based shipment monitoring application with ERD, database schema and logistics process mapping.',
    ],
  },
];

export const skills = [
  { group: 'Backend', items: ['PHP', 'Laravel (v9 to v12)', 'CodeIgniter 3 and 4', 'Node.js', 'Python'] },
  { group: 'Frontend', items: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'jQuery'] },
  { group: 'Data', items: ['MySQL', 'PostgreSQL', 'Neon PostgreSQL', 'Drizzle ORM', 'ApexCharts', 'Chart.js'] },
  { group: 'Integration', items: ['REST API', 'OAuth 2.0', 'Accurate Online API', 'WhatsApp click-to-chat', 'AJAX', 'Anthropic API'] },
  { group: 'Delivery', items: ['Git', 'GitHub', 'GitHub Actions', 'Hostinger', 'Vercel', 'Railway'] },
  { group: 'Practice', items: ['ERP development', 'System analysis', 'Requirements gathering', 'Role-based access control', 'Admin dashboards', 'POS applications', 'Figma'] },
];

export const education = [
  {
    degree: 'Master of Computer Science',
    school: 'Universitas Esa Unggul',
    period: '2026 to Present',
    note: 'GPA 3.85/4.00 (after first semester)',
  },
  {
    degree: 'Bachelor of Information Technology',
    school: 'Universitas Bina Sarana Informatika',
    period: '2020 to 2025',
    note: 'GPA 3.95/4.00, Cum Laude. Thesis: Web-Based Payroll Information System Using CodeIgniter 3 and Waterfall SDLC to Improve HR Operational Efficiency at PT Beauty Abadi Utama.',
  },
];

export const certifications = [
  { name: 'PHP Certificate, Beginner to Advanced', issuer: 'Udemy', year: '2024' },
  { name: 'Front-End Web Development', issuer: 'Coding Studio', year: '2024' },
  { name: 'TOEFL Prediction Test', issuer: 'Score 590', year: '' },
];

export const testimonials = [
  {
    quote: 'Bagas delivered the HRD Dashboard and NailShade Booking System well ahead of schedule. His ability to understand HR workflows and translate them into a clean, functional system impressed our entire team. Communication was professional throughout, and the results exceeded expectations.',
    name: 'Dian Rahmawati',
    role: 'HR Supervisor',
    org: 'Rainbrow Sulam Alis',
  },
  {
    quote: 'The warehouse and delivery modules follow how we actually work: goods receiving with QC, stock movements, customer-owned material, and delivery notes in one system. Our monthly stock reports for material, WIP and finished goods are now built from the receiving, requisition and delivery documents themselves. Bagas took the time to understand our daily routine and kept adjusting the system to fit it.',
    name: 'Aprizal Nurul Husna',
    role: 'Warehouse & Delivery Supervisor',
    org: 'PT Ganzu Gisma Seiko',
  },
  {
    quote: 'The QC module covers our inspection points: incoming material, customer-supplied material and in-process production. Inspection results, NG records and rework are tied to their source documents, which makes tracing a quality issue far more straightforward. Bagas listened closely to how QC actually works and adjusted the system to match.',
    name: 'Yusrizal',
    role: 'QA/QC Manager',
    org: 'PT Ganzu Gisma Seiko',
  },
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'business', label: 'Business systems' },
  { id: 'tools', label: 'Web apps and tools' },
  { id: 'data', label: 'Data and AI' },
  { id: 'mobile', label: 'Mobile and PWA' },
  { id: 'websites', label: 'Websites' },
];
