<div align="center">

<img src="https://img.shields.io/badge/RideNest-Platform%20Rental%20Kendaraan-2563EB?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xOCAyYTEgMSAwIDAgMC0xIDFoLTFhMiAyIDAgMCAwLTIgMkg0YTIgMiAwIDAgMC0yIDJ2MTJhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjZhMiAyIDAgMCAwLTItMnoiLz48L3N2Zz4=" />

# 🚗 RideNest

### Platform Rental Kendaraan Terpercaya di Indonesia

Sewa motor, mobil, travel, hingga bus — tersedia dengan harga transparan.\
Booking mudah, berangkat nyaman.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)](https://supabase.com)

</div>

---

## 📸 Tampilan Aplikasi

### Landing Page
<div align="center">
  <img src="docs/landing-page-hero.jpg" width="80%" alt="Landing Page Hero" />
  <p><em>Hero section dengan CTA dan informasi platform</em></p>
</div>

<div align="center">
  <img src="docs/landing-page-categories.jpg" width="80%" alt="Kategori Kendaraan" />
  <p><em>Pilihan kategori kendaraan: Motor, Mobil, Travel, Bus</em></p>
</div>

<div align="center">
  <img src="docs/landing-page-howto-footer.jpg" width="80%" alt="Cara Kerja & Footer" />
  <p><em>Panduan 3 langkah & footer</em></p>
</div>

### Autentikasi
<div align="center">
  <img src="docs/register-page.jpg" width="80%" alt="Register" />
  <p><em>Registrasi sebagai Pengguna atau Penyedia Layanan</em></p>
</div>

<div align="center">
  <img src="docs/login-browse-page.jpg" width="80%" alt="Login & Browse" />
  <p><em>Login dan halaman pencarian kendaraan dengan filter kategori</em></p>
</div>

### Booking Kendaraan
<div align="center">
  <img src="docs/service-detail-booking.jpg" width="80%" alt="Detail & Booking" />
  <p><em>Detail layanan dengan kalender booking dan konfirmasi</em></p>
</div>

<div align="center">
  <img src="docs/booking-history-profile-user.jpg" width="80%" alt="Riwayat Booking & Profil" />
  <p><em>Riwayat booking dengan status dan halaman edit profil user</em></p>
</div>

### Dashboard Penyedia Layanan
<div align="center">
  <img src="docs/provider-dashboard-services.jpg" width="80%" alt="Provider Dashboard" />
  <p><em>Dashboard provider — statistik, daftar booking masuk, dan kelola layanan</em></p>
</div>

<div align="center">
  <img src="docs/provider-edit-service-schedule.jpg" width="80%" alt="Edit Layanan & Jadwal" />
  <p><em>Edit detail layanan dan kelola jadwal ketersediaan kendaraan</em></p>
</div>

---

## ✨ Fitur Utama

### Untuk Pengguna
- 🔍 **Browse & Filter** kendaraan berdasarkan kategori (Motor, Mobil, Travel, Bus)
- 📅 **Booking dengan Kalender** — pilih tanggal check-in & check-out
- 📋 **Riwayat Booking** — pantau status pemesanan (Menunggu, Dikonfirmasi, Selesai, Dibatalkan)
- 👤 **Profil** — edit informasi pribadi

### Untuk Penyedia Layanan
- 📊 **Dashboard** — statistik total booking, pendapatan, layanan aktif
- ➕ **Kelola Layanan** — tambah, edit, hapus kendaraan yang disewakan
- 🗓️ **Kelola Jadwal** — atur hari aktif dan blokir tanggal tertentu
- ✅ **Konfirmasi Booking** — terima atau tolak pesanan masuk
- 🏢 **Profil Penyedia** — edit informasi perusahaan

### Umum
- 🔐 **Autentikasi JWT** — login aman untuk User dan Provider
- 🚌 **Supir Wajib** — Travel & Bus otomatis dengan supir
- 📱 **Responsive** — tampilan optimal di desktop dan mobile

---

## 🏗️ Struktur Repo (Monorepo)

```
RideNest/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Definisi semua tabel DB
│   ├── src/
│   │   ├── app.ts               # Entry point — inisialisasi server
│   │   ├── lib/
│   │   │   └── prisma.ts        # Instance Prisma (koneksi DB)
│   │   ├── middleware/
│   │   │   └── auth.ts          # Verifikasi JWT token
│   │   ├── controllers/         # Logika bisnis per fitur
│   │   │   ├── auth.ts          # Register & Login
│   │   │   ├── service.ts       # CRUD layanan kendaraan
│   │   │   ├── availability.ts  # Jadwal & blokir tanggal
│   │   │   ├── booking.ts       # Buat & kelola booking
│   │   │   └── profile.ts       # Edit profil
│   │   └── routes/              # Daftar URL endpoint
│   │       ├── auth.ts
│   │       ├── service.ts
│   │       ├── availability.ts
│   │       ├── booking.ts
│   │       └── profile.ts
│   ├── .env                     # Konfigurasi (DB, JWT, PORT)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Daftar semua route halaman
│   │   ├── main.tsx             # Entry point React
│   │   ├── api/
│   │   │   └── axiosInstance.ts # Setup HTTP client + auto sisip token
│   │   ├── store/
│   │   │   └── authStore.ts     # State global login (Zustand)
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types/interfaces
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── UserNavbar.tsx     # Navbar user (browse, profil)
│   │   │   │   └── ProtectedRoute.tsx # Guard halaman yang butuh login
│   │   │   └── ui/              # Komponen UI shadcn (Button, Input, dll)
│   │   └── pages/
│   │       ├── LandingPage.tsx        # Halaman utama (/)
│   │       ├── BrowsePage.tsx         # Cari kendaraan (/browse)
│   │       ├── ServiceDetailPage.tsx  # Detail + booking (/services/:id)
│   │       ├── BookingsPage.tsx       # Riwayat booking user (/bookings)
│   │       ├── ProfilePage.tsx        # Edit profil (/profile)
│   │       ├── auth/
│   │       │   ├── LoginPage.tsx      # (/login)
│   │       │   └── RegisterPage.tsx   # (/register)
│   │       └── provider/
│   │           ├── ProviderDashboardPage.tsx  # Dashboard (/provider/dashboard)
│   │           ├── AddServicePage.tsx         # Kelola layanan (/provider/services)
│   │           ├── EditServicePage.tsx        # Edit layanan (/provider/services/:id/edit)
│   │           └── SchedulePage.tsx           # Jadwal (/provider/services/:id/schedule)
│   ├── .env                     # VITE_API_URL
│   └── package.json
│
├── docs/                        # Screenshot & dokumentasi visual
└── README.md
```

---

## 🛠️ Tech Stack

### Backend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Express.js** | v5 | Web framework — handle HTTP request/response |
| **TypeScript** | v6 | Typing statis agar kode lebih aman |
| **Prisma ORM** | v6 | Query database, migrasi, generate client |
| **PostgreSQL** | — | Database relasional |
| **bcrypt** | v6 | Hash password sebelum disimpan ke DB |
| **jsonwebtoken** | v9 | Generate & verifikasi JWT token autentikasi |
| **cors** | v2 | Izinkan request dari frontend (cross-origin) |
| **dotenv** | v17 | Load variabel dari file `.env` |
| **tsx** | v4 | Jalankan TypeScript langsung tanpa compile (dev mode) |

### Frontend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **React** | v19 | UI framework berbasis komponen |
| **TypeScript** | v6 | Typing statis |
| **Vite** | v8 | Build tool & dev server (sangat cepat) |
| **React Router DOM** | v7 | Routing SPA (`/browse`, `/login`, dll) |
| **Axios** | v1 | HTTP client untuk komunikasi ke backend |
| **Zustand** | v5 | State management global (auth store) |
| **Tailwind CSS** | v4 | Utility-first CSS framework |
| **shadcn/ui** | v4 | Komponen UI siap pakai (Button, Input, Card, dll) |
| **Radix UI** | v1 | Komponen primitif headless (dasar shadcn) |
| **Lucide React** | v1 | Library ikon SVG |
| **tw-animate-css** | — | Animasi Tailwind (animate-pulse, dll) |
| **Geist Variable** | — | Font yang dipakai (`@fontsource-variable/geist`) |

### Infrastruktur & Deploy

| Layer | Teknologi |
|-------|-----------|
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Railway |
| **Database Host** | Supabase (PostgreSQL) |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat

Pastikan tools berikut sudah terinstall:

- **Node.js** >= 18 — [Download](https://nodejs.org)
- **npm** >= 9 (sudah termasuk dalam Node.js)
- **Akun Supabase** — [Daftar gratis](https://supabase.com) untuk mendapatkan `DATABASE_URL`

---

### 1. Clone Repository

```bash
git clone https://github.com/GirindraSW/RideNest.git
cd RideNest
```

---

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Buka file `.env` dan isi variabel berikut:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
JWT_SECRET="isi-dengan-string-acak-yang-kuat"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL=http://localhost:5173
```

> 💡 `DATABASE_URL` bisa didapat dari dashboard Supabase → **Project Settings → Database → Connection String (URI mode)**

Jalankan migrasi database dan start server:

```bash
npx prisma db push     # Sinkronkan schema ke database
npm run dev            # Server berjalan di http://localhost:5000
```

---

### 3. Setup Frontend

Buka terminal baru, lalu:

```bash
cd frontend
npm install
cp .env.example .env
```

Buka file `.env` dan isi:

```env
VITE_API_URL=http://localhost:5000/api
```

Jalankan dev server:

```bash
npm run dev            # App berjalan di http://localhost:5173
```

---

### ✅ Verifikasi

Setelah kedua server berjalan:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |

---

## 🔗 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/auth/register/user` | ❌ | Daftar akun pengguna |
| `POST` | `/api/auth/register/provider` | ❌ | Daftar akun penyedia |
| `POST` | `/api/auth/login` | ❌ | Login semua role |
| `GET` | `/api/auth/me` | ✅ | Info user aktif |
| `GET` | `/api/services` | ❌ | Daftar semua layanan |
| `GET` | `/api/services?category=MOBIL` | ❌ | Filter by kategori |
| `GET` | `/api/services/:id` | ❌ | Detail layanan |
| `POST` | `/api/services` | ✅ Provider | Tambah layanan |
| `PUT` | `/api/services/:id` | ✅ Provider | Edit layanan |
| `DELETE` | `/api/services/:id` | ✅ Provider | Hapus layanan |
| `GET` | `/api/provider/profile` | ✅ Provider | Profil penyedia |
| `PUT` | `/api/provider/profile` | ✅ Provider | Update profil penyedia |

---

## 👥 Tim Pengembang

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/GirindraSW">
        <img src="https://github.com/GirindraSW.png" width="80px" style="border-radius:50%" alt="Girindra"/><br/>
        <b>Girindra Sulistiyo W.</b>
      </a><br/>
      <sub>⚡ Frontend Developer</sub><br/>
      <sub>React · TypeScript · Tailwind</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Ryoota95">
        <img src="https://github.com/Ryoota95.png" width="80px" style="border-radius:50%" alt="Rayyan"/><br/>
        <b>Rayyan Aby Yazid</b>
      </a><br/>
      <sub>🔧 Backend Developer</sub><br/>
      <sub>Express · Prisma · PostgreSQL</sub>
    </td>
  </tr>
</table>

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran. © 2025 RideNest Team.
