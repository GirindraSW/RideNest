<div align="center">

<img src="https://img.shields.io/badge/RideNest-Platform%20Rental%20Kendaraan-2563EB?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xOCAyYTEgMSAwIDAgMC0xIDFoLTFhMiAyIDAgMCAwLTIgMkg0YTIgMiAwIDAgMC0yIDJ2MTJhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjZhMiAyIDAgMCAwLTItMnoiLz48L3N2Zz4=" />

# 🚗 RideNest

### Platform Rental Kendaraan Terpercaya di Indonesia

Sewa motor, mobil, travel, hingga bus — tersedia dengan harga transparan.\
Booking mudah, berangkat nyaman.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
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
├── frontend/          # ReactJS + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # Axios API client
│   │   └── types/         # TypeScript interfaces
│   └── package.json
│
├── backend/           # ExpressJS + TypeScript + Prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/    # JWT auth & role guard
│   │   ├── lib/           # Prisma client
│   │   └── types/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── docs/              # Screenshot & dokumentasi visual
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Backend** | Express.js, TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (jsonwebtoken) |
| **Deploy FE** | Vercel |
| **Deploy BE** | Railway |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js >= 18
- npm >= 9
- Akun [Supabase](https://supabase.com) untuk database

### 1. Clone repo

```bash
git clone https://github.com/GirindraSW/RideNest.git
cd RideNest
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Isi `.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL=http://localhost:5173
```

```bash
npx prisma db push
npm run dev
# Server berjalan di http://localhost:5000
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Isi `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# App berjalan di http://localhost:5173
```

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
