/**
 * KasKita - Supabase Cloud Synchronization Adapter & Setup
 * 
 * Modul ini menyediakan adapter siap pakai jika Anda ingin menghubungkan KasKita
 * ke Supabase (Cloud PostgreSQL + Auth + Storage).
 * 
 * Cara Penggunaan:
 * 1. Buat project baru di https://supabase.com
 * 2. Jalankan SQL Schema di bawah di SQL Editor Supabase
 * 3. Masukkan SUPABASE_URL dan SUPABASE_ANON_KEY di modal pengaturan
 */

const SupabaseConfig = {
  url: localStorage.getItem('kaskita_supabase_url') || '',
  anonKey: localStorage.getItem('kaskita_supabase_key') || '',
  client: null,

  init() {
    if (this.url && this.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.url, this.anonKey);
        console.log("Supabase Client initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize Supabase:", err);
      }
    }
  },

  sqlSchema: `-- SQL SCHEMA UNTUK SUPABASE KAS KELAS
-- 1. Tabel Pengaturan
CREATE TABLE IF NOT EXISTS class_settings (
  id INT PRIMARY KEY DEFAULT 1,
  class_name TEXT NOT NULL DEFAULT 'XII MIPA 2',
  school_name TEXT NOT NULL DEFAULT 'SMA Negeri 1',
  cash_per_week NUMERIC NOT NULL DEFAULT 5000,
  current_month TEXT NOT NULL DEFAULT 'Oktober 2026',
  treasurer_name TEXT,
  treasurer_phone TEXT,
  payment_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Siswa
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  absen TEXT NOT NULL,
  name TEXT NOT NULL,
  gender VARCHAR(2) DEFAULT 'L',
  phone TEXT,
  payments JSONB DEFAULT '{"w1":false,"w2":false,"w3":false,"w4":false}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Pengeluaran & Bukti Nota
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE class_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan Akses:
-- Publik/Siswa: READ ONLY (Bisa melihat laporan tanpa login)
CREATE POLICY "Public Read Access Settings" ON class_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Access Students" ON students FOR SELECT USING (true);
CREATE POLICY "Public Read Access Expenses" ON expenses FOR SELECT USING (true);

-- Bendahara (Authenticated / Admin Service Role): FULL CRUD
CREATE POLICY "Admin Full Access Settings" ON class_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Students" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');
`
};
