# FinTrack - Personal Finance Tracker

Aplikasi Web Pencatatan Keuangan Pribadi yang Cepat, Terstruktur, dan Visual sesuai spesifikasi **Product Requirements Document (PRD)**.

---

## 🚀 Fitur Utama

### 1. Autentikasi & Manajemen Sesi (F-01)
- Registrasi akun, Login, dan Logout.
- Proteksi rute dengan **Next.js Middleware**.
- Keamanan kata sandi menggunakan enkripsi **bcrypt**.
- Sesi berbasis token JWT (`jose`) via *HTTP-only cookies*.
- Setiap data keuangan terisolasi ketat berdasarkan kepemilikan (`userId`).

### 2. Manajemen Dompet & Akun (F-02)
- Mengelola multi-sumber dana (Rekening Bank, E-Wallet, Dompet Tunai, dll.).
- Saldo otomatis tersinkronisasi saat transaksi dibuat, diedit, atau dihapus.
- Warna dan ikon penanda untuk kemudahan identifikasi visual.

### 3. CRUD Transaksi — Quick Entry < 10 Detik (F-03)
- Modal pencatatan instan dengan pilihan jenis: **Pengeluaran**, **Pemasukan**, dan **Transfer Antar Dompet**.
- Format Rupiah (`Rp`) otomatis dan presisi.
- Selector kategori dengan ikon visual dan warna.
- Tanggal transaksi & catatan opsional.
- Pembaruan saldo dompet dibungkus dalam **Prisma Transaction (`prisma.$transaction`)** untuk konsistensi ACID 100%.

### 4. Kategori Bawaan & Kustom (F-04)
- *Auto-seeding* kategori default saat registrasi (Makan & Minum, Transportasi, Tagihan, Belanja, Hiburan, Kesehatan, Gaji, Bonus, Investasi).
- Tambah, edit, dan hapus kategori kustom dengan pilihan 20+ ikon Lucide dan 12 palet warna.

### 5. Dashboard Ringkasan & KPI (F-05)
- **Total Saldo Gabungan** dari semua dompet.
- **Pemasukan Bulan Ini** beserta indikator pertumbuhan vs bulan lalu.
- **Pengeluaran Bulan Ini** beserta indikator pertumbuhan vs bulan lalu.
- **Arus Kas Bersih (Net Cash Flow)**: Status Surplus atau Defisit.

### 6. Visualisasi Grafik Interaktif (F-06)
- **Bar Chart (Arus Kas 6 Bulan Terakhir):** Perbandingan visual pemasukan vs pengeluaran setiap bulan menggunakan **Recharts**.
- **Donut Chart (Distribusi Pengeluaran):** Proporsi pos pengeluaran terbesar untuk bulan aktif berdasarkan kategori.

### 7. Riwayat, Filter & Pencarian (F-07)
- Filter berdasarkan bulan (*month picker*).
- Filter jenis transaksi (Pemasukan, Pengeluaran, Transfer).
- Filter sumber dompet & kategori.
- Pencarian teks catatan transaksi secara *real-time*.
- Rekap total pemasukan & pengeluaran untuk hasil filter aktif.
- Aksi edit dan hapus dengan penyesuaian saldo otomatis.

### 8. Fitur Fase 2 (Nilai Tambah)
- **Batas Anggaran Bulanan (*Category Budgeting*):** Menetapkan target maksimal pengeluaran per kategori per bulan dengan *progress bar* dinamis:
  - 🟢 Hijau: Aman (< 80%)
  - 🟡 Kuning: Waspada / Hampir Habis (80% - 99%)
  - 🔴 Merah: Over Budget (> 100%)
- **Transfer Antar Dompet:** Memindahkan saldo (misal: BCA ke GoPay / Tunai) tanpa menambah pos pengeluaran.
- **Ekspor Laporan CSV:** Unduh rekapan transaksi ke file format `.csv` kompatibel Microsoft Excel.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions, Server Components, TypeScript)
- **Styling:** Tailwind CSS, Lucide React Icons
- **Database ORM:** Prisma ORM
- **Database:** SQLite (default lokal *zero-setup*) / PostgreSQL (Neon, Supabase)
- **Visualisasi Grafik:** Recharts
- **Validasi Data:** Zod

---

## 💻 Cara Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18 ke atas (Direkomendasikan Node.js v20+)
- npm / pnpm / yarn

### 2. Menjalankan Server Development
Jalankan perintah berikut di terminal:

```bash
# Menjalankan server lokal
npm run dev
```

Buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Akun Demo Siap Pakai

Telah disediakan akun demo lengkap dengan data riwayat transaksi, dompet, dan target anggaran:
- **Email:** `demo@fintrack.id`
- **Password:** `password123`

*Atau Anda dapat mendaftarkan akun baru melalui menu **Daftar Gratis** di halaman login.*

---

## 🗄️ Mengubah Database ke PostgreSQL (Neon / Supabase)

Untuk menghubungkan ke PostgreSQL di cloud (misalnya saat *deployment* ke Vercel):

1. Buka file `prisma/schema.prisma`.
2. Ubah `provider = "sqlite"` menjadi `provider = "postgresql"`.
3. Buka file `.env` dan perbarui `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-example.neon.tech/fintrack?sslmode=require"
   ```
4. Jalankan migrasi:
   ```bash
   npx prisma db push
   ```

