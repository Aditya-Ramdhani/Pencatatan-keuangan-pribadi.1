# Product Requirements Document (PRD): Aplikasi Web Pencatatan Keuangan Pribadi

| Atribut Dokumen | Detail |
| :--- | :--- |
| **Nama Produk** | Personal Finance Tracker (FinTrack / DompetKu — *nama sementara*) |
| **Versi Dokumen** | 1.0 (MVP & Roadmap) |
| **Status** | Draft Siap Pengembangan |
| **Arsitektur Utama** | Full-Stack Web App (Next.js App Router + PostgreSQL) |
| **Target Pengguna** | Individu yang ingin memantau arus kas (*cash flow*) harian & bulanan secara terstruktur |

---

## 1. Latar Belakang & Tujuan Produk

### Masalah yang Ingin Diselesaikan
Pencatatan keuangan secara manual (di catatan ponsel atau ingatan) sering gagal bertahan lama karena proses input yang merepotkan, data tersebar di berbagai metode pembayaran (tunai, rekening bank, *e-wallet*), serta sulitnya melihat gambaran besar apakah pengeluaran bulanan masih sehat atau sudah melewati batas.

### Tujuan Utama
1. **Menyediakan pencatatan transaksi yang cepat:** Pengguna dapat mencatat pemasukan atau pengeluaran dalam waktu kurang dari 10 detik, baik melalui desktop maupun browser ponsel.
2. **Memberikan visibilitas arus kas secara visual:** Menampilkan grafik perbandingan pemasukan vs pengeluaran bulanan dan distribusi pengeluaran per kategori agar pengguna langsung sadar di mana kebocoran anggaran terjadi.
3. **Menjamin privasi dan keamanan data:** Setiap pengguna memiliki akun terisolasi sehingga riwayat transaksi tersimpan aman di database dan dapat diakses dari perangkat mana saja.

---

## 2. User Persona & Alur Pengguna (User Flow)

### Target Pengguna Utama
* **Profil:** Mahasiswa, pekerja muda, atau *freelancer* dengan beberapa sumber transaksi harian (uang saku/gaji/proyek, makan, transportasi, langganan digital, belanja).
* **Kebutuhan Utama:** Antarmuka bersih tanpa fitur akuntansi yang rumit, ringkasan saldo otomatis, dan grafik bulanan yang mudah dibaca sekilas.

### Alur Pengguna Utama (Core User Flow)
1. **Autentikasi:** Pengguna membuka aplikasi $\rightarrow$ diarahkan ke halaman `/login` (atau `/register` jika pengguna baru) $\rightarrow$ masuk menggunakan Email/Password atau akun Google.
2. **Inisialisasi Awal (Onboarding Singkat):** Pengguna membuat minimal satu dompet/akun keuangan (misalnya: *Tunai*, *Bank BCA*, *GoPay*) dengan saldo awal.
3. **Melihat Ringkasan:** Pengguna masuk ke `/dashboard` dan langsung melihat total saldo, arus kas bulan berjalan, serta grafik bulanan.
4. **Mencatat Transaksi:** Pengguna menekan tombol **"+ Catat Transaksi"** $\rightarrow$ memilih jenis (*Pemasukan* / *Pengeluaran*), nominal, kategori, dompet sumber, dan catatan singkat $\rightarrow$ menyimpan data $\rightarrow$ saldo dompet dan grafik otomatis terbarui.
5. **Evaluasi Bulanan:** Pengguna memfilter riwayat transaksi atau melihat grafik per kategori untuk mengevaluasi pengeluaran bulan ini dibandingkan bulan sebelumnya.

---

## 3. Spesifikasi Fitur (Functional Requirements)

Fitur dibagi menjadi dua fase agar aplikasi cepat selesai dan langsung nyaman dipakai, lalu bisa ditingkatkan secara bertahap.

### Fase 1: Minimum Viable Product (MVP — Wajib Ada)

| ID | Nama Fitur | Deskripsi & Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **F-01** | **Autentikasi & Manajemen Sesi** | Registrasi akun, login, logout, dan proteksi halaman (*middleware*). Pengguna yang belum login otomatis diarahkan ke halaman login. Setiap data transaksi terikat ketat pada `user_id`. | Tinggi |
| **F-02** | **Manajemen Dompet / Akun** | Pengguna dapat menambah dan mengelola beberapa sumber dana (misal: *Rekening Utama*, *E-Wallet*, *Dompet Tunai*). Saldo masing-masing akun terhitung otomatis berdasarkan transaksi masuk dan keluar. | Tinggi |
| **F-03** | **CRUD Transaksi (Quick Entry)** | Menambah, mengedit, dan menghapus transaksi dengan atribut: Tipe (*Income* / *Expense*), Nominal (format Rupiah `Rp`), Kategori, Dompet, Tanggal, dan Catatan opsional. | Tinggi |
| **F-04** | **Kategori Bawaan & Kustom** | Menyediakan kategori default (*Gaji, Bonus, Makan & Minum, Transportasi, Tagihan, Hiburan, Belanja*) serta kemampuan bagi pengguna untuk menambah/mengedit kategori beserta ikon dan warna pembeda. | Tinggi |
| **F-05** | **Dashboard Ringkasan** | Kartu KPI utama di bagian atas: **Total Saldo Gabungan**, **Total Pemasukan Bulan Ini**, **Total Pengeluaran Bulan Ini**, dan **Selisih Bersih (Net Cash Flow)** lengkap dengan persentase perbandingan dari bulan lalu. | Tinggi |
| **F-06** | **Visualisasi Grafik Bulanan** | 1. **Bar Chart (Arus Kas 6–12 Bulan Terakhir):** Membandingkan batang pemasukan vs pengeluaran setiap bulan.<br>2. **Donut Chart (Proporsi Pengeluaran):** Memecah pengeluaran bulan aktif berdasarkan kategori untuk melihat pos terbesar. | Tinggi |
| **F-07** | **Riwayat & Filter Transaksi** | Daftar transaksi berurutan dari yang terbaru dengan fitur pencarian berdasarkan catatan serta filter berdasarkan rentang tanggal, tipe transaksi, kategori, dan dompet. | Sedang |

### Fase 2: Fitur Pendukung Kebiasaan & Analitik Lanjutan (Opsional)

* **Batas Anggaran Bulanan (*Category Budgeting*):** Pengguna dapat menetapkan batas maksimal per kategori (misal: *Makan & Minum* maksimal `Rp 1.500.000/bulan`). Sistem menampilkan *progress bar* yang berubah warna menjadi kuning saat pemakaian mencapai lebih dari 80% dan merah jika melewati 100%.
* **Transfer Antar Dompet:** Mencatat perpindahan saldo (misal: tarik tunai dari ATM ke Dompet Tunai atau *top-up* e-wallet) tanpa terhitung sebagai pengeluaran baru.
* **Transaksi Berulang (*Recurring*):** Otomatisasi pencatatan untuk biaya tetap seperti langganan internet, kos, atau gaji bulanan.
* **Ekspor Laporan:** Mengunduh rekap transaksi bulanan ke format CSV/Excel untuk keperluan arsip pribadi.

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Desain Mobile-First & Responsif:** Pencatatan pengeluaran paling sering dilakukan saat sedang di luar rumah lewat ponsel. Tata letak wajib nyaman di layar HP (termasuk tombol aksi cepat yang mudah dijangkau ibu jari) sekaligus luas untuk grafik saat dibuka di laptop.
2. **Keamanan Data:**
   * Password di-hash menggunakan `bcrypt` atau `argon2`.
   * Validasi skema input di sisi server menggunakan **Zod** untuk mencegah data korup atau injeksi.
   * Otorisasi berbasis kepemilikan (*row-level ownership check*) di setiap aksi server agar pengguna A tidak pernah bisa membaca atau mengubah data pengguna B.
3. **Presisi Mata Uang:** Nominal uang wajib disimpan menggunakan tipe data `BigInt` atau `Decimal` di database (bukan `Float`) untuk menghindari kesalahan pembulatan aritmatika.
4. **Performa Cepat:** Pemuatan awal dashboard di bawah 1,5 detik menggunakan *Server-Side Rendering* (SSR) Next.js.

---

## 5. Arsitektur Sistem & Tech Stack Optimal

Arsitektur berikut dipilih karena menyatukan *frontend* dan *backend* dalam satu repositori Next.js sehingga proses pengembangan cepat, *type-safe* dari database hingga UI, serta hemat biaya *hosting*.

```text
[ Browser / Mobile Web ]
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│               Next.js Full-Stack (App Router)           │
│  ┌───────────────────────┐   ┌───────────────────────┐  │
│  │  UI & Visualisasi     │   │  Backend Logic        │  │
│  │  • React Server Comp. │   │  • Server Actions     │  │
│  │  • Tailwind + shadcn  │   │  • Route Handlers     │  │
│  │  • Recharts (Grafik)  │   │  • Zod Validation     │  │
│  └───────────────────────┘   └───────────┬───────────┘  │
│                                          │              │
│  ┌───────────────────────────────────────▼───────────┐  │
│  │  Auth.js (NextAuth)  │  Prisma / Drizzle ORM      │  │
│  └──────────────────────┴────────────────────────────┘  │
└──────────────────────────────────────────┬──────────────┘
                                           │
                                           ▼
                         [ PostgreSQL Database (Supabase / Neon) ]
```

### Detail Pemilihan Teknologi
* **Framework Utama:** **Next.js (App Router) + TypeScript** — Server Components membuat halaman dashboard dan grafik langsung dirender dengan data terbaru tanpa *loading spinner* berlapis, sementara **Server Actions** mempermudah proses simpan/edit transaksi langsung dari form tanpa repot menulis banyak boilerplate REST API manual.
* **Styling & Komponen UI:** **Tailwind CSS + shadcn/ui** — Memberikan tampilan bersih, modern, mendukung *Dark Mode* bawaan, dan memiliki komponen siap pakai seperti *Dialog/Modal* (untuk input transaksi cepat), *Date Picker*, *Select*, dan *Data Table*.
* **Library Grafik:** **Recharts** — Ringan, berbasis komponen React, responsif mengikuti lebar layar, dan mudah dikustomisasi untuk *Bar Chart* bulanan maupun *Donut Chart* kategori.
* **Autentikasi:** **Auth.js (NextAuth v5)** — Mendukung login menggunakan kredensial (Email + Password) maupun OAuth (Login with Google) dengan sesi terenkripsi via *HTTP-only cookies*.
* **Database & ORM:** **PostgreSQL** (layanan cloud gratis seperti **Neon** atau **Supabase**) + **Prisma ORM** — Struktur data keuangan bersifat relasional (User $\rightarrow$ Wallet $\rightarrow$ Transaction $\rightarrow$ Category), sehingga PostgreSQL dengan transaksi ACID memastikan saldo dompet selalu sinkron dan konsisten.
* **Deployment:** **Vercel** — Terintegrasi langsung dengan ekosistem Next.js untuk deployment otomatis setiap kali ada pembaruan kode.

---

## 6. Rancangan Skema Database (ERD Ringkas)

Berikut adalah struktur tabel inti yang dibutuhkan untuk mendukung seluruh fitur MVP dan transfer antar dompet:

1. **`users`**
   * `id` (UUID, Primary Key)
   * `name` (String)
   * `email` (String, Unique)
   * `password_hash` (String, Nullable jika login via Google)
   * `created_at` (Timestamp)

2. **`wallets`** (Sumber dana: Tunai, Bank, E-Wallet)
   * `id` (UUID, Primary Key)
   * `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`)
   * `name` (String — contoh: `"BCA"`, `"GoPay"`, `"Tunai"`)
   * `type` (Enum: `CASH`, `BANK`, `EWALLET`)
   * `balance` (BigInt / Decimal — menyimpan saldo terkini)
   * `created_at` (Timestamp)

3. **`categories`**
   * `id` (UUID, Primary Key)
   * `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`)
   * `name` (String — contoh: `"Makan & Minum"`, `"Gaji"`)
   * `type` (Enum: `INCOME`, `EXPENSE`)
   * `icon` (String — nama ikon)
   * `color` (String — kode hex warna untuk konsistensi di grafik)

4. **`transactions`**
   * `id` (UUID, Primary Key)
   * `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`)
   * `wallet_id` (UUID, Foreign Key $\rightarrow$ `wallets.id`)
   * `category_id` (UUID, Foreign Key $\rightarrow$ `categories.id`)
   * `type` (Enum: `INCOME`, `EXPENSE`)
   * `amount` (BigInt / Decimal)
   * `note` (String, Nullable)
   * `transaction_date` (DateTime)
   * `created_at` (Timestamp)

> **Catatan Logika Backend:** Setiap kali transaksi baru dibuat, diedit, atau dihapus, pembaruan tabel `transactions` dan pembaruan kolom `balance` pada tabel `wallets` wajib dibungkus dalam satu **Database Transaction** (`prisma.$transaction`) agar tidak pernah terjadi selisih antara riwayat transaksi dan saldo dompet.

---

## 7. Roadmap & Tahapan Pengembangan

* **Minggu 1 — Fondasi & Autentikasi:** Inisialisasi proyek Next.js + Tailwind + shadcn/ui, setup PostgreSQL + Prisma schema, serta implementasi halaman Register, Login, dan proteksi rute.
* **Minggu 2 — Manajemen Dompet, Kategori & CRUD Transaksi:** Membuat fitur tambah dompet, *seeding* kategori default saat user baru mendaftar, serta form pencatatan pemasukan dan pengeluaran dengan pembaruan saldo otomatis.
* **Minggu 3 — Dashboard & Visualisasi Grafik:** Membangun agregasi query bulanan di backend dan menampilkannya ke dalam kartu ringkasan saldo, *Bar Chart* bulanan, dan *Donut Chart* kategori.
* **Minggu 4 — Filter, Polish Mobile UI & Deployment:** Menambahkan fitur pencarian/filter riwayat transaksi, memastikan tampilan nyaman di layar ponsel, pengujian validasi input, dan deployment ke Vercel.