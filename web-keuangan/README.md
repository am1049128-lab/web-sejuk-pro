# 💰 KasKita - Sistem Manajemen & Transparansi Keuangan Kas Kelas

Aplikasi web modern, responsif, dan interaktif yang dirancang khusus untuk memecahkan permasalahan pengelolaan kas kelas: transparansi penuh bagi seluruh siswa dan kemudahan pencatatan bagi bendahara.

---

## ✨ Fitur Utama

1. **Dashboard Ringkasan (Overview)**
   - **Total Saldo Real-Time**: Perhitungan otomatis pemasukan dikurangi pengeluaran.
   - **Metrik Keuangan**: Total Pemasukan, Total Pengeluaran, dan Tingkat Kepatuhan Bayar Siswa.
   - **Grafik Tren Arus Kas**: Visualisasi perbandingan pemasukan vs pengeluaran mingguan menggunakan Chart.js.
   - **Diagram Alokasi Pengeluaran**: Distribusi kategori belanja (Peralatan Kelas, Kebersihan, Modul/Fotokopi, Konsumsi, Kas Sosial).
   - **Riwayat Pengeluaran Terakhir**: Akses cepat melihat mutasi uang kas terbaru.

2. **Matrix Status Pembayaran Siswa (Payment Matrix)**
   - Tabel visual interaktif seluruh siswa per minggu (Minggu 1 s/d 4).
   - Status badge **Lunas (Hijau)** dan **Belum Bayar (Merah)**.
   - Deteksi otomatis jumlah minggu menunggak dan total tagihan (Rp).
   - Pencarian siswa berdasarkan nama atau nomor absen, serta filter khusus yang menunggak atau lunas.
   - **Aksi Cepat Bendahara**: Toggle 1-klik untuk mengubah status bayar atau menandai lunas seluruh kelas sekaligus.

3. **Fitur Pengingat Tagihan WhatsApp (WhatsApp Reminder)**
   - Tombol **"Tagih WA"** di samping siswa yang menunggak.
   - Otomatis membuat draf pesan penagihan yang ramah, sopan, dan formal berformat WhatsApp (`*bold*`, emoji santun).
   - Menyertakan rincian tunggakan minggu ke berapa, nominal total, dan nomor rekening/e-wallet bendahara (BCA, Dana, GoPay).
   - Langsung membuka WhatsApp Web / Aplikasi WhatsApp via `wa.me`.

4. **Pencatatan Pengeluaran & Galeri Bukti Nota (Nota Viewer)**
   - Form input pengeluaran: Tanggal, Kategori, Nominal, Keperluan, dan upload Foto Nota/Resi.
   - Mendukung jepret langsung via kamera smartphone atau unggah gambar galeri (JPG/PNG).
   - **Modal Viewer Bukti Nota**: Siswa maupun wali kelas dapat melihat foto fisik struk/nota belanja dalam resolusi tinggi untuk transparansi mutlak.

5. **Hak Akses (Role-Based Access)**
   - **Mode Siswa (Read-Only)**: Default terbuka untuk publik/siswa tanpa perlu repot login. Siswa dapat memantau saldo, bukti nota, status kas, dan scan QR.
   - **Mode Bendahara (Admin)**: Dilindungi autentikasi PIN (Default: `1234`). Memberikan akses penuh untuk mencatat pengeluaran, mengubah status lunas, menambah/menghapus siswa, serta mengubah pengaturan kas.

6. **Ekspor & Cetak Laporan**
   - **Ekspor CSV/Excel**: Unduh file `.csv` rapi berformat UTF-8 BOM yang langsung terbaca rapi di Microsoft Excel.
   - **Cetak Laporan Resmi (PDF Ready)**: Dilengkapi kop surat resmi kelas, periode, rincian tabel, dan format tanda tangan Wali Kelas & Bendahara.

7. **Akses Cepat via QR Code Papan Tulis**
   - Modal QR Code otomatis sesuai URL aplikasi saat ini.
   - Tersedia tombol cetak kartu QR Code untuk ditempel langsung di papan tulis atau mading kelas.

---

## 🚀 Cara Menjalankan Secara Lokal

### Menggunakan Node.js:
1. Buka terminal di folder `web-keuangan`:
   ```bash
   cd web-keuangan
   node serve.js
   ```
2. Buka browser di [http://localhost:3000](http://localhost:3000).

### Tanpa Server (Direct File):
- Cukup klik ganda (double-click) pada file `index.html` di komputer Anda, dan aplikasi langsung berjalan penuh berkat LocalStorage offline.

---

## 🌐 Panduan Deployment Gratis (Online)

### 1. Vercel
1. Upload folder ini ke repository GitHub.
2. Buka [vercel.com](https://vercel.com) dan hubungkan repository Anda.
3. Klik **Deploy** (Tanpa konfigurasi build, langsung aktif dalam hitungan detik).

### 2. Netlify
1. Buka [netlify.com](https://netlify.com).
2. Tarik (drag-and-drop) seluruh folder `web-keuangan` ke dashboard Netlify Drop.
3. Anda langsung mendapatkan URL web kas kelas publik yang siap dibagikan ke grup kelas.

### 3. GitHub Pages
1. Push proyek ke repository GitHub Anda.
2. Buka **Settings** > **Pages** > pilih branch `main` dan folder `/ (root)`.

---

## ☁️ Integrasi Cloud Database (Opsional: Supabase)

Jika Anda ingin sinkronisasi real-time antar perangkat bendahara di cloud:
1. Buat project baru di [Supabase](https://supabase.com).
2. Salin SQL schema yang telah disediakan di file `js/supabase.js` dan jalankan di SQL Editor Supabase.
3. Masukkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.

---

## 🔒 Informasi Login Demo
- **Role Siswa**: Langsung aktif tanpa login (Read-Only).
- **Role Bendahara**: Klik tombol "Login Bendahara" di pojok kanan atas, masukkan PIN: `1234` (dapat diubah di menu Pengaturan).
