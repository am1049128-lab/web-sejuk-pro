/**
 * KasKita - Inisialisasi Data Awal & State Kas Kelas
 * Berisi data realistis kelas, siswa, riwayat pembayaran, pengeluaran & nota bukti.
 */

// Contoh nota SVG data URL agar web langsung memiliki bukti nota visual tanpa file eksternal
function createSampleReceiptSVG(title, nominal, date, shopName) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="520" viewBox="0 0 360 520">
    <rect width="360" height="520" fill="#fafafa"/>
    <rect x="15" y="15" width="330" height="490" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="15" y1="90" x2="345" y2="90" stroke="#cbd5e1" stroke-dasharray="6,4" stroke-width="2"/>
    
    <text x="180" y="48" font-family="'Courier New', monospace" font-size="18" font-weight="bold" text-anchor="middle" fill="#1e293b">${shopName}</text>
    <text x="180" y="68" font-family="'Courier New', monospace" font-size="12" text-anchor="middle" fill="#64748b">BUKTI RESMI TRANSAKSI KAS</text>
    
    <text x="35" y="125" font-family="'Courier New', monospace" font-size="12" fill="#475569">Tanggal : ${date}</text>
    <text x="35" y="145" font-family="'Courier New', monospace" font-size="12" fill="#475569">Keperluan : ${title}</text>
    <text x="35" y="165" font-family="'Courier New', monospace" font-size="12" fill="#475569">Status    : LUNAS (TERVERIFIKASI)</text>
    
    <line x1="35" y1="185" x2="325" y2="185" stroke="#94a3b8" stroke-width="1"/>
    
    <text x="35" y="215" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#334155">Rincian Pembelian:</text>
    <text x="35" y="240" font-family="'Courier New', monospace" font-size="12" fill="#475569">1. ${title}</text>
    <text x="325" y="240" font-family="'Courier New', monospace" font-size="12" text-anchor="end" fill="#0f172a">Rp ${Number(nominal).toLocaleString('id-ID')}</text>
    
    <line x1="35" y1="280" x2="325" y2="280" stroke="#cbd5e1" stroke-dasharray="4,3" stroke-width="1"/>
    
    <text x="35" y="315" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a">TOTAL BAYAR</text>
    <text x="325" y="315" font-family="'Courier New', monospace" font-size="16" font-weight="bold" text-anchor="end" fill="#059669">Rp ${Number(nominal).toLocaleString('id-ID')}</text>
    
    <rect x="80" y="360" width="200" height="70" rx="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <text x="180" y="390" font-family="'Courier New', monospace" font-size="11" text-anchor="middle" fill="#64748b">STAMPEL BENDAHARA KELAS</text>
    <text x="180" y="412" font-family="'Courier New', monospace" font-size="13" font-weight="bold" text-anchor="middle" fill="#059669">✓ SAH &amp; TERBUKTI</text>
    
    <text x="180" y="475" font-family="'Courier New', monospace" font-size="11" text-anchor="middle" fill="#94a3b8">Simpan bukti ini untuk transparansi kelas</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const DEFAULT_DATA = {
  settings: {
    className: "XII MIPA 2",
    schoolName: "SMA Negeri 1 Prestasi",
    academicYear: "2026/2027",
    cashPerWeek: 5000,
    adminPin: "1234",
    treasurerName: "Zahra & Farhan (Bendahara)",
    treasurerPhone: "081234567890",
    paymentInfo: "BCA: 1234-5678-90 a.n Zahra Putri | Dana/GoPay: 081234567890",
    currentMonth: "Oktober 2026",
    totalWeeks: 4
  },
  students: [
    { id: 1, absen: "01", name: "Achmad Maulana", gender: "L", phone: "081234567801", payments: { w1: true, w2: true, w3: true, w4: false } },
    { id: 2, absen: "02", name: "Aisyah Nur Rahma", gender: "P", phone: "081234567802", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 3, absen: "03", name: "Alif Pratama Putra", gender: "L", phone: "081234567803", payments: { w1: true, w2: false, w3: false, w4: false } },
    { id: 4, absen: "04", name: "Amanda Chelsea", gender: "P", phone: "081234567804", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 5, absen: "05", name: "Bagus Setiawan", gender: "L", phone: "081234567805", payments: { w1: true, w2: true, w3: false, w4: false } },
    { id: 6, absen: "06", name: "Bella Safitri", gender: "P", phone: "081234567806", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 7, absen: "07", name: "Christian Timothy", gender: "L", phone: "081234567807", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 8, absen: "08", name: "Citra Kirana Dewi", gender: "P", phone: "081234567808", payments: { w1: true, w2: true, w3: true, w4: false } },
    { id: 9, absen: "09", name: "Dimas Anggara", gender: "L", phone: "081234567809", payments: { w1: false, w2: false, w3: false, w4: false } },
    { id: 10, absen: "10", name: "Dinda Maharani", gender: "P", phone: "081234567810", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 11, absen: "11", name: "Fadhil Muhammad", gender: "L", phone: "081234567811", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 12, absen: "12", name: "Gita Cantika", gender: "P", phone: "081234567812", payments: { w1: true, w2: true, w3: false, w4: false } },
    { id: 13, absen: "13", name: "Hafizh Rabbani", gender: "L", phone: "081234567813", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 14, absen: "14", name: "Indah Permatasari", gender: "P", phone: "081234567814", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 15, absen: "15", name: "Kevin Sanjaya", gender: "L", phone: "081234567815", payments: { w1: true, w2: true, w3: true, w4: false } },
    { id: 16, absen: "16", name: "Larasati Kusuma", gender: "P", phone: "081234567816", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 17, absen: "17", name: "Muhammad Rizky", gender: "L", phone: "081234567817", payments: { w1: true, w2: true, w3: false, w4: false } },
    { id: 18, absen: "18", name: "Nabila Syakieb", gender: "P", phone: "081234567818", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 19, absen: "19", name: "Oka Mahendra", gender: "L", phone: "081234567819", payments: { w1: false, w2: false, w3: false, w4: false } },
    { id: 20, absen: "20", name: "Putri Rahayu", gender: "P", phone: "081234567820", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 21, absen: "21", name: "Raffi Ahmadani", gender: "L", phone: "081234567821", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 22, absen: "22", name: "Rania Khansa", gender: "P", phone: "081234567822", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 23, absen: "23", name: "Satria Dewa", gender: "L", phone: "081234567823", payments: { w1: true, w2: true, w3: true, w4: false } },
    { id: 24, absen: "24", name: "Siti Nurhaliza", gender: "P", phone: "081234567824", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 25, absen: "25", name: "Taufik Hidayat", gender: "L", phone: "081234567825", payments: { w1: true, w2: false, w3: false, w4: false } },
    { id: 26, absen: "26", name: "Tiara Andini", gender: "P", phone: "081234567826", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 27, absen: "27", name: "Vino Bastian", gender: "L", phone: "081234567827", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 28, absen: "28", name: "Wanda Hamidah", gender: "P", phone: "081234567828", payments: { w1: true, w2: true, w3: true, w4: true } },
    { id: 29, absen: "29", name: "Yuda Pratama", gender: "L", phone: "081234567829", payments: { w1: true, w2: true, w3: true, w4: false } },
    { id: 30, absen: "30", name: "Zahra Putri (Bendahara)", gender: "P", phone: "081234567830", payments: { w1: true, w2: true, w3: true, w4: true } }
  ],
  expenses: [
    {
      id: 1,
      date: "2026-10-02",
      title: "Spidol Whiteboard (3 Pcs) & Penghapus",
      category: "Peralatan Kelas",
      amount: 35000,
      description: "Beli 2 spidol hitam, 1 spidol biru merk Snowman dan penghapus magnetik untuk papan tulis kelas.",
      receiptUrl: createSampleReceiptSVG("Spidol & Penghapus Whiteboard", 35000, "02/10/2026", "TB. ATK Berkah Jaya"),
      receiptName: "nota_atk_02okt.jpg"
    },
    {
      id: 2,
      date: "2026-10-06",
      title: "Alat Kebersihan (Sapu Ijuk, Pel & Wipol)",
      category: "Kebersihan",
      amount: 62000,
      description: "Penggantian sapu ijuk yang patah, kain pel baru dan cairan pembersih lantai wipol wangi cemara.",
      receiptUrl: createSampleReceiptSVG("Alat Kebersihan & Wipol", 62000, "06/10/2026", "Minimarket Barokah"),
      receiptName: "nota_kebersihan_06okt.jpg"
    },
    {
      id: 3,
      date: "2026-10-10",
      title: "Fotokopi Kisi-Kisi & Modul Latihan Fisika",
      category: "Fotokopi & Modul",
      amount: 45000,
      description: "Fotokopi materi latihan persiapan ujian tengah semester 30 siswa x 3 lembar.",
      receiptUrl: createSampleReceiptSVG("Fotokopi Modul Fisika 30 Siswa", 45000, "10/10/2026", "Fotocopy Sahabat Kampus"),
      receiptName: "nota_fotokopi_10okt.jpg"
    },
    {
      id: 4,
      date: "2026-10-14",
      title: "Konsumsi Rapat Porseni & Class Meeting",
      category: "Konsumsi",
      amount: 50000,
      description: "Air mineral botol 1 karton dan cemilan untuk perwakilan kelas rapat teknis classmeeting.",
      receiptUrl: createSampleReceiptSVG("Konsumsi Rapat Porseni", 50000, "14/10/2026", "Toko Sembako Sejahtera"),
      receiptName: "nota_konsumsi_14okt.jpg"
    },
    {
      id: 5,
      date: "2026-10-16",
      title: "Kas Sosial: Menjenguk Rekan Sekelas Sakit",
      category: "Sosial & Duka",
      amount: 100000,
      description: "Beli parcel buah segar dan sumbangan lekas sembuh untuk rekan Dimas yang dirawat di RS.",
      receiptUrl: createSampleReceiptSVG("Parcel Buah & Donasi Sosial", 100000, "16/10/2026", "Toko Buah Segar Alami"),
      receiptName: "nota_sosial_16okt.jpg"
    }
  ]
};

// Storage Manager
const Storage = {
  KEY: 'kaskita_db_v1',
  AUTH_KEY: 'kaskita_auth_session',

  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Storage load error, falling back to default", e);
    }
    this.save(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Storage save error", e);
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
    return this.load();
  },

  isLoggedIn() {
    return sessionStorage.getItem(this.AUTH_KEY) === 'true';
  },

  setLogin(status) {
    if (status) {
      sessionStorage.setItem(this.AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(this.AUTH_KEY);
    }
  }
};
