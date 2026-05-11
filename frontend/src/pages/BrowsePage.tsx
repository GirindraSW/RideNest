import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "@/api/axiosInstance";
import type { PublicService, VehicleCategory } from "@/types";
import UserNavbar from "@/components/layout/UserNavbar";
import { Car, Bike, Bus, Navigation, BadgeCheck, ArrowRight } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────

const CATEGORIES: { value: VehicleCategory | "SEMUA"; label: string; icon: typeof Car }[] = [
  { value: "SEMUA",  label: "Semua",  icon: Car },
  { value: "MOTOR",  label: "Motor",  icon: Bike },
  { value: "MOBIL",  label: "Mobil",  icon: Car },
  { value: "TRAVEL", label: "Travel", icon: Navigation },
  { value: "BUS",    label: "Bus",    icon: Bus },
];

const CAT_COLOR: Record<VehicleCategory, { bg: string; text: string }> = {
  MOTOR:  { bg: "bg-orange-100", text: "text-orange-700" },
  MOBIL:  { bg: "bg-blue-100",   text: "text-blue-700" },
  TRAVEL: { bg: "bg-green-100",  text: "text-green-700" },
  BUS:    { bg: "bg-purple-100", text: "text-purple-700" },
};

const CAT_ICON: Record<VehicleCategory, typeof Car> = {
  MOTOR: Bike, MOBIL: Car, TRAVEL: Navigation, BUS: Bus,
};

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(Number(value));
}

// ─── Service Card ────────────────────────────────────────────────

function ServiceCard({ service }: { service: PublicService }) {
  const Icon = CAT_ICON[service.category];
  const col  = CAT_COLOR[service.category];

  return (
    <Link to={`/services/${service.id}`}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
        {/* Foto kendaraan */}
        <div className="h-40 bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
          {service.imageUrl
            ? <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
            : <Icon className="w-16 h-16 text-slate-300" />
          }
        </div>

        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Badge kategori + verified */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${col.bg} ${col.text}`}>
              <Icon className="w-3 h-3" />
              {service.category}
            </span>
            {service.provider.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                <BadgeCheck className="w-3.5 h-3.5" />
                Terverifikasi
              </span>
            )}
          </div>

          {/* Judul + tipe */}
          <div>
            <h3 className="font-semibold text-slate-900 leading-snug">{service.title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{service.vehicleType}</p>
          </div>

          {/* Provider */}
          <p className="text-xs text-slate-400">{service.provider.companyName}</p>

          {/* Harga + CTA */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
            <div>
              <span className="text-lg font-bold text-slate-900">
                {formatRupiah(service.pricePerDay)}
              </span>
              <span className="text-xs text-slate-400"> / hari</span>
            </div>
            <span className="flex items-center gap-1 text-sm text-blue-600 font-medium">
              Lihat <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = (searchParams.get("category") as VehicleCategory) || "SEMUA";

  const [activeCategory, setActiveCategory] = useState<VehicleCategory | "SEMUA">(initialCat);
  const [services, setServices] = useState<PublicService[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    const params = activeCategory !== "SEMUA" ? { category: activeCategory } : {};
    api
      .get<{ services: PublicService[] }>("/services", { params })
      .then((res) => setServices(res.data.services))
      .catch(() => setServices([]))
      .finally(() => setFetching(false));
  }, [activeCategory]);

  function handleCategoryChange(cat: VehicleCategory | "SEMUA") {
    setActiveCategory(cat);
    if (cat === "SEMUA") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cari Kendaraan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Pilih kendaraan yang sesuai dengan kebutuhanmu
          </p>
        </div>

        {/* Tab filter kategori */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryChange(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-colors
                ${activeCategory === value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Results */}
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-600">Tidak ada layanan ditemukan</p>
            <p className="text-sm text-slate-400">
              Coba pilih kategori lain atau cek kembali nanti.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-medium text-slate-700">{services.length}</span> layanan
              {activeCategory !== "SEMUA" && ` untuk ${activeCategory}`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
