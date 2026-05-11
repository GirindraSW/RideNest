import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  Car, Bike, Bus, Navigation, Search, Calendar, CheckCircle2,
  ArrowRight, MapPin, Shield, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserNavbar from "@/components/layout/UserNavbar";
import heroImage from "@/assets/brio.png";

const categories = [
  {
    icon: Bike,
    title: "Motor",
    value: "MOTOR",
    desc: "Sewa motor harian yang nyaman dan hemat untuk mobilitas sehari-hari.",
    colorBg: "bg-orange-50",
    colorText: "text-orange-600",
    border: "border-orange-200 hover:border-orange-400",
  },
  {
    icon: Car,
    title: "Mobil",
    value: "MOBIL",
    desc: "Pilih dari berbagai tipe mulai dari Brio, Avanza hingga SUV premium.",
    colorBg: "bg-blue-50",
    colorText: "text-blue-600",
    border: "border-blue-200 hover:border-blue-400",
  },
  {
    icon: Navigation,
    title: "Travel",
    value: "TRAVEL",
    desc: "Perjalanan antar kota dengan driver berpengalaman dan armada nyaman.",
    colorBg: "bg-green-50",
    colorText: "text-green-600",
    border: "border-green-200 hover:border-green-400",
  },
  {
    icon: Bus,
    title: "Bus",
    value: "BUS",
    desc: "Sewa bus untuk rombongan wisata, acara kantor, atau perjalanan jauh.",
    colorBg: "bg-purple-50",
    colorText: "text-purple-600",
    border: "border-purple-200 hover:border-purple-400",
  },
];

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Pilih Layanan",
    desc: "Cari dan pilih kategori kendaraan sesuai kebutuhanmu.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Buat Booking",
    desc: "Tentukan tanggal sewa dan lengkapi detail pemesananmu.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Nikmati Perjalanan",
    desc: "Kendaraan siap untukmu. Berangkat dan nikmati perjalanan!",
  },
];

const badges = [
  { icon: Shield, text: "Terverifikasi" },
  { icon: Clock, text: "Tersedia 24/7" },
  { icon: MapPin, text: "Seluruh Indonesia" },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  return (
    <div className="min-h-screen bg-white">
      <UserNavbar />

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center bg-linear-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Platform Rental Kendaraan Terpercaya
              </div>

              <h1 className="text-5xl font-bold text-slate-900 leading-tight">
                Sewa Kendaraan
                <span className="text-blue-600"> Kebutuhanmu</span>,<br />
                Kapan Saja
              </h1>

              <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                Motor, mobil, travel, hingga bus tersedia dengan harga transparan.
                Booking mudah, berangkat nyaman.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to={loggedIn ? "/browse" : "/register"}>
                  <Button size="lg" className="gap-2 shadow-lg shadow-blue-200">
                    {loggedIn ? "Cari Kendaraan" : "Mulai Sekarang"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#services">
                  <Button size="lg" variant="outline">
                    Lihat Layanan
                  </Button>
                </a>
              </div>

              <div className="flex items-center gap-6 pt-2">
                {badges.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Icon className="w-4 h-4 text-blue-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden lg:flex justify-center items-center">
              <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
              <img
                src={heroImage}
                alt="Kendaraan"
                className="relative w-full max-w-lg object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-medium text-sm mb-2">Kategori</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Pilih Jenis Kendaraan</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Tersedia berbagai pilihan kendaraan untuk semua kebutuhan perjalananmu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(({ icon: Icon, title, value, desc, colorBg, colorText, border }) => (
              <Link to={`/browse?category=${value}`} key={title}>
                <div
                  className={`group p-6 rounded-2xl border-2 ${border} transition-all duration-200 hover:shadow-lg h-full cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${colorBg} ${colorText} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-lg">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-medium text-sm mb-2">Panduan</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Cara Kerja RideNest</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Pesan kendaraanmu dalam 3 langkah mudah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map(({ icon: Icon, step, title, desc }, idx) => (
              <div key={step} className="relative text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {step}
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Siap Memulai Perjalananmu?</h2>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Daftar sekarang dan dapatkan pengalaman rental yang mudah, transparan, dan terpercaya.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {loggedIn ? (
              <Link to="/browse">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  Cari Kendaraan Sekarang
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="shadow-lg">
                    Daftar Sebagai Pengguna
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/30 shadow-lg"
                  >
                    Daftar Sebagai Penyedia
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">RideNest</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 RideNest. Semua hak dilindungi.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Tentang</a>
            <a href="#" className="hover:text-white transition-colors">Kontak</a>
            <a href="#" className="hover:text-white transition-colors">Kebijakan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
