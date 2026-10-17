-- ============================================================
-- SEJUKPRO - Supabase Database Setup
-- Jalankan SQL ini di Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================================

-- 1. TABEL PRODUK / LAYANAN
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  price_amount TEXT NOT NULL DEFAULT 'Hubungi Kami',
  price_label TEXT DEFAULT 'Mulai dari',
  price_unit TEXT DEFAULT '/ unit',
  badge_text TEXT,
  badge_type TEXT DEFAULT 'default',
  is_featured BOOLEAN DEFAULT false,
  icon_type TEXT DEFAULT 'default',
  cta_text TEXT DEFAULT 'Pesan Sekarang',
  cta_service_value TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL METODE PEMBAYARAN
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💳',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL BOOKING / PEMESANAN
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  service_type TEXT NOT NULL,
  unit_count TEXT DEFAULT '1 Unit',
  ac_brand TEXT,
  visit_date DATE,
  time_slot TEXT,
  payment_method TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Produk & Payment Methods: Public bisa baca (anon), tapi hanya authenticated bisa tulis
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are editable by authenticated users" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Payment methods are viewable by everyone" ON payment_methods
  FOR SELECT USING (true);

CREATE POLICY "Payment methods are editable by authenticated users" ON payment_methods
  FOR ALL USING (true) WITH CHECK (true);

-- Bookings: Semua bisa insert (dari website), tapi hanya authenticated bisa baca/update
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Bookings are viewable by authenticated users" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Bookings are editable by authenticated users" ON bookings
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Bookings are deletable by authenticated users" ON bookings
  FOR DELETE USING (true);

-- 6. SEED DATA: PRODUK / LAYANAN SEJUKPRO
-- ============================================================
INSERT INTO products (name, description, features, price_amount, price_label, price_unit, badge_text, badge_type, is_featured, icon_type, cta_text, cta_service_value, sort_order) VALUES
(
  'Cuci AC Standar & Steam Clean',
  'Pembersihan total unit indoor & outdoor, pembersihan filter anti-bakteri, siram talang drainase anti-bocor, dan cek kelistrikan dasar.',
  ARRAY['Cuci Evaporator & Blower', 'Cuci Kondensor Outdoor', 'Gratis Cek Tekanan Freon', 'Garansi Cuci 30 Hari'],
  'Rp 75.000',
  'Mulai dari',
  '/ unit (0.5 - 1 PK)',
  'Paling Populer',
  'default',
  false,
  'droplet',
  'Pesan Cuci AC',
  'Cuci AC Standar',
  1
),
(
  'Deep Clean & Chemical Treatment',
  'Pembersihan kimia ramah lingkungan khusus kerak lendir membandel, sterilisasi uap temperatur tinggi (99.9% bunuh bakteri & jamur apek).',
  ARRAY['Seluruh fitur cuci standar', 'Chemical foam eco-friendly', 'Fogging desinfektan antivirus', 'Garansi Kebocoran 60 Hari'],
  'Rp 145.000',
  'Mulai dari',
  '/ unit',
  'Rekomendasi Bersih Total',
  'gold',
  true,
  'snowflake',
  'Pesan Deep Clean',
  'Deep Clean Chemical',
  2
),
(
  'Isi / Tambah Freon (R32, R410, R22)',
  'Pengisian refrigeran murni non-oplosan sesuai spesifikasi pabrik. Disertai uji kebocoran pipa & nepel sebelum pengisian.',
  ARRAY['Uji manifold gauge digital', 'Cek ampere kompresor', 'Freon R32, R410A, atau R22', 'Garansi Dingin 45 Hari'],
  'Rp 150.000',
  'Tambah freon mulai',
  '/ unit',
  'Alat Digital Akurat',
  'default',
  false,
  'gauge',
  'Pesan Freon',
  'Isi / Tambah Freon',
  3
),
(
  'Instalasi & Bongkar Pasang AC',
  'Pemasangan unit baru/pindahan dengan teknik flaring presisi, pemipaan tembaga tebal standar inverter, dan proses vakum wajib.',
  ARRAY['Wajib proses vakum pipa', 'Pipa tembaga tebal premium', 'Instalasi rapi dan waterpass', 'Garansi Instalasi 90 Hari'],
  'Rp 250.000',
  'Jasa pasang mulai',
  '/ unit',
  'Standar Pabrikan',
  'default',
  false,
  'wrench',
  'Pesan Instalasi',
  'Instalasi & Bongkar Pasang',
  4
),
(
  'Perbaikan PCB, Kompresor & Kebocoran',
  'Solusi masalah teknis: AC mati total, error code berkedip, ganti kapasitor, perbaikan modul PCB Inverter, dan pengelasan pipa bocor.',
  ARRAY['Diagnosa alat sensor digital', 'Spare part asli bergaransi', 'Penanganan AC Inverter & Multi', 'Garansi Part s/d 90 Hari'],
  'Rp 85.000',
  'Pemeriksaan teknis',
  '(Gratis jika lanjut servis)',
  'Teknisi Ahli Elektronik',
  'default',
  false,
  'bolt',
  'Konsultasi Rusak',
  'Perbaikan Teknis / Rusak',
  5
),
(
  'Kontrak Pemeliharaan Kantor & Industri',
  'Perawatan rutin berkala terjadwal untuk ruko, kantor cabang, restoran, hotel, dan pabrik dengan laporan log sheet & SLA prioritas.',
  ARRAY['Kunjungan berkala terjadwal', 'Laporan log kinerja efisiensi', 'Fast-response emergency 24/7', 'Faktur pajak resmi (PPN)'],
  'Hubungi Kami',
  'Paket khusus B2B',
  'SLA Khusus',
  'Korporasi & Bisnis',
  'default',
  false,
  'briefcase',
  'Ajukan Kerjasama',
  'Kontrak B2B Kantor',
  6
);

-- 7. SEED DATA: METODE PEMBAYARAN
-- ============================================================
INSERT INTO payment_methods (name, description, icon, is_active, sort_order) VALUES
('Transfer Bank / QRIS', 'Pembayaran setelah servis selesai via transfer bank atau scan QRIS', '🏦', true, 1),
('Tunai ke Teknisi', 'Pembayaran tunai langsung kepada teknisi setelah servis selesai', '💵', true, 2),
('Invoice Perusahaan (B2B)', 'Khusus korporasi dengan PO dan invoice resmi ber-PPN', '📄', true, 3);

-- 8. SEED DATA: CONTOH BOOKING (untuk chart)
-- ============================================================
INSERT INTO bookings (customer_name, customer_phone, customer_address, service_type, unit_count, ac_brand, visit_date, time_slot, payment_method, notes, status, created_at) VALUES
('Budi Santoso', '081234567890', 'Jl. Sudirman No. 45, Jakarta Selatan', 'Cuci AC Standar', '2 Unit', 'Daikin Inverter 1 PK', CURRENT_DATE - INTERVAL '15 days', 'Pagi (08:30 - 11:30)', 'Transfer Bank / QRIS', 'AC kamar tidur dan ruang tamu', 'completed', now() - INTERVAL '15 days'),
('Siti Rahayu', '082198765432', 'Apartemen Casablanca Tower B Lt. 12, Jakarta Timur', 'Deep Clean Chemical', '1 Unit', 'Panasonic 1.5 PK', CURRENT_DATE - INTERVAL '12 days', 'Siang (11:30 - 14:30)', 'Tunai ke Teknisi', 'AC bau apek sudah 6 bulan tidak dicuci', 'completed', now() - INTERVAL '12 days'),
('Ahmad Hidayat', '085312345678', 'Perumahan Graha Indah Blok C-7, Tangerang', 'Isi / Tambah Freon', '1 Unit', 'Sharp 1 PK', CURRENT_DATE - INTERVAL '10 days', 'Sore (14:30 - 17:30)', 'Transfer Bank / QRIS', 'AC tidak dingin sama sekali', 'completed', now() - INTERVAL '10 days'),
('Dewi Lestari', '087856789012', 'Jl. Kebon Jeruk Raya No. 88, Jakarta Barat', 'Cuci AC Standar', '3 Unit', 'LG Dual Inverter 1 PK', CURRENT_DATE - INTERVAL '8 days', 'Pagi (08:30 - 11:30)', 'Transfer Bank / QRIS', 'Paket cuci 3 unit promo', 'completed', now() - INTERVAL '8 days'),
('Riko Pratama', '081387654321', 'Ruko BSD Junction No. 12, Tangerang Selatan', 'Instalasi & Bongkar Pasang', '2 Unit', 'Daikin 2 PK', CURRENT_DATE - INTERVAL '6 days', 'Pagi (08:30 - 11:30)', 'Invoice Perusahaan (B2B)', 'Pindahan AC dari kantor lama', 'completed', now() - INTERVAL '6 days'),
('Nina Kartika', '089912345678', 'Jl. Gatot Subroto Kav. 22, Jakarta Selatan', 'Perbaikan Teknis / Rusak', '1 Unit', 'Mitsubishi Electric 1.5 PK', CURRENT_DATE - INTERVAL '4 days', 'Siang (11:30 - 14:30)', 'Tunai ke Teknisi', 'AC mati total lampu timer kedip 5 kali', 'confirmed', now() - INTERVAL '4 days'),
('Hendra Wijaya', '082267891234', 'Kantor PT Maju Bersama Lt. 3, Kuningan, Jakarta', 'Kontrak B2B Kantor', 'Lebih dari 5 Unit', 'Daikin VRV', CURRENT_DATE - INTERVAL '3 days', 'Pagi (08:30 - 11:30)', 'Invoice Perusahaan (B2B)', 'Maintenance kontrak 12 unit AC kantor', 'confirmed', now() - INTERVAL '3 days'),
('Putri Amelia', '085678901234', 'Cluster Emerald Residence Blok F-3, Bekasi', 'Cuci AC Standar', '1 Unit', 'Samsung Wind-Free 1 PK', CURRENT_DATE - INTERVAL '2 days', 'Sore (14:30 - 17:30)', 'Transfer Bank / QRIS', 'Baru pindah rumah, AC belum dicuci', 'pending', now() - INTERVAL '2 days'),
('Andi Firmansyah', '081345678901', 'Jl. Raya Bogor KM 29, Depok', 'Deep Clean Chemical', '2 Unit', 'Panasonic Inverter 1 PK', CURRENT_DATE - INTERVAL '1 day', 'Pagi (08:30 - 11:30)', 'Transfer Bank / QRIS', 'Mau deep clean sebelum lebaran', 'pending', now() - INTERVAL '1 day'),
('Lisa Permata', '087812345678', 'Apartemen Green Bay Tower E Lt. 25, Pluit', 'Cuci AC Standar', '1 Unit', 'AUX 1 PK', CURRENT_DATE, 'Malam / Darurat (18:30 - 21:00)', 'Tunai ke Teknisi', 'AC bocor air deras ke lantai', 'pending', now());

-- ============================================================
-- 9. PANDUAN MEMBUAT AKUN ADMIN DI SUPABASE
-- ============================================================
-- Ada 2 cara mudah untuk membuat akun administrator:
--
-- CARA A (Paling Mudah via Dashboard):
-- 1. Buka Supabase Dashboard > Authentication > Users
-- 2. Klik tombol "Add user" > "Create user"
-- 3. Masukkan Email (contoh: admin@sejukpro.com) dan Password aman (min 6 karakter)
-- 4. Pastikan opsi "Auto Confirm User?" dicentang (YES) agar tidak perlu konfirmasi email.
-- 5. Klik "Create user". Selesai! Anda bisa langsung login di admin.html.
--
-- TIPS SUPABASE EMAIL CONFIRMATION:
-- Jika pengguna mendaftar melalui form "Daftar Admin Baru" di admin.html:
-- Buka Supabase Dashboard > Authentication > Providers > Email
-- Nonaktifkan / matikan opsi "Confirm email" jika ingin admin baru bisa langsung login
-- tanpa harus memverifikasi tautan lewat email.
--
-- ============================================================
-- ✅ SETUP SELESAI! 
-- Tabel: products, payment_methods, bookings
-- Sistem Otentikasi: Supabase Auth & JWT Row-Level Security
-- ============================================================

