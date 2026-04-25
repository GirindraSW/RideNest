import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import type { VehicleCategory, Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Car, Bike, Bus, Navigation, Plus, Trash2, LogOut,
  CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, CalendarDays,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: VehicleCategory; label: string; icon: typeof Car }[] = [
  { value: "MOTOR",  label: "Motor",  icon: Bike },
  { value: "MOBIL",  label: "Mobil",  icon: Car },
  { value: "TRAVEL", label: "Travel", icon: Navigation },
  { value: "BUS",    label: "Bus",    icon: Bus },
];

const CATEGORY_COLORS: Record<VehicleCategory, string> = {
  MOTOR:  "bg-orange-100 text-orange-700",
  MOBIL:  "bg-blue-100 text-blue-700",
  TRAVEL: "bg-green-100 text-green-700",
  BUS:    "bg-purple-100 text-purple-700",
};

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "MOBIL" as VehicleCategory,
  vehicleType: "",
  pricePerDay: "",
  minDuration: "1",
  maxDuration: "",
  withDriver: false,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddServicePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [form, setForm] = useState(INITIAL_FORM);
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isDriverRequired = form.category === "TRAVEL" || form.category === "BUS";

  // Ambil daftar layanan saat halaman dimuat
  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setFetching(true);
    try {
      const res = await api.get<{ services: Service[] }>("/services/my");
      setServices(res.data.services);
    } catch {
      // Abaikan error fetch — tampilkan list kosong
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/services", {
        ...form,
        pricePerDay: parseFloat(form.pricePerDay),
        minDuration: parseInt(form.minDuration),
        maxDuration: form.maxDuration ? parseInt(form.maxDuration) : null,
        withDriver: isDriverRequired ? true : form.withDriver,
      });
      setSuccess("Layanan berhasil ditambahkan!");
      setForm(INITIAL_FORM);
      setShowForm(false);
      fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambahkan layanan");
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus layanan ini?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Gagal menghapus layanan");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleAvailable(service: Service) {
    try {
      const res = await api.put<{ service: Service }>(`/services/${service.id}`, {
        isAvailable: !service.isAvailable,
      });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? res.data.service : s))
      );
    } catch {
      alert("Gagal mengubah status layanan");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Provider */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">RideNest</span>
            <span className="text-slate-400 text-sm ml-1">/ Dashboard Penyedia</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-slate-600">
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Layanan Saya</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola daftar kendaraan yang kamu sewakan
            </p>
          </div>
          <Button
            onClick={() => { setShowForm((v) => !v); setError(""); setSuccess(""); }}
            className="gap-2"
          >
            {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Tutup Form" : "Tambah Layanan"}
          </Button>
        </div>

        {/* Alert sukses global */}
        {success && !showForm && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Form Tambah Layanan */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="font-semibold text-slate-900 text-lg">Form Tambah Layanan</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Judul */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Judul Layanan</Label>
                <Input
                  placeholder="Contoh: Sewa Avanza Harian"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Kategori Kendaraan</Label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, category: value })}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-medium transition-colors
                        ${form.category === value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
                {isDriverRequired && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Kategori {form.category} wajib menggunakan supir.
                  </div>
                )}
              </div>

              {/* Tipe Kendaraan */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Tipe Kendaraan</Label>
                <Input
                  placeholder="Contoh: Avanza, Brio, Viar, Hiace"
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Deskripsi{" "}
                  <span className="text-slate-400 font-normal">(opsional)</span>
                </Label>
                <Textarea
                  placeholder="Kondisi kendaraan, fasilitas, catatan penting, dll."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Harga & Durasi */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Harga / Hari (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="150000"
                    value={form.pricePerDay}
                    onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                    required
                    min="0"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Min. Hari</Label>
                  <Input
                    type="number"
                    value={form.minDuration}
                    onChange={(e) => setForm({ ...form, minDuration: e.target.value })}
                    required
                    min="1"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">
                    Maks. Hari{" "}
                    <span className="text-slate-400 font-normal text-xs">(opsional)</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Tak terbatas"
                    value={form.maxDuration}
                    onChange={(e) => setForm({ ...form, maxDuration: e.target.value })}
                    min="1"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Dengan Supir */}
              {!isDriverRequired && (
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm({ ...form, withDriver: !form.withDriver })}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-1
                      ${form.withDriver ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform
                        ${form.withDriver ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Tersedia dengan supir
                  </span>
                </label>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                  <XCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="submit" className="flex-1 h-11" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Layanan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => { setShowForm(false); setForm(INITIAL_FORM); setError(""); }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Daftar Layanan */}
        {fetching ? (
          <div className="text-center py-16 text-slate-400">Memuat layanan...</div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <Car className="w-7 h-7 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">Belum ada layanan</p>
            <p className="text-sm text-slate-400">
              Klik "Tambah Layanan" untuk mulai menawarkan kendaraanmu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const catMeta = CATEGORIES.find((c) => c.value === service.category);
              const Icon = catMeta?.icon ?? Car;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
                >
                  {/* Header kartu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[service.category]}`}
                      >
                        <Icon className="w-3 h-3" />
                        {service.category}
                      </span>
                      <h3 className="font-semibold text-slate-900 leading-tight truncate">
                        {service.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{service.vehicleType}</p>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  {service.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Info */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Harga/hari</span>
                      <span className="font-semibold text-slate-900">
                        {formatRupiah(service.pricePerDay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Durasi min.</span>
                      <span className="text-slate-700">{service.minDuration} hari</span>
                    </div>
                    {service.maxDuration && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Durasi maks.</span>
                        <span className="text-slate-700">{service.maxDuration} hari</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dengan supir</span>
                      <span className={service.withDriver ? "text-green-600 font-medium" : "text-slate-400"}>
                        {service.withDriver ? "Ya" : "Tidak"}
                      </span>
                    </div>
                  </div>

                  {/* Footer — status + aksi */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {/* Toggle tersedia */}
                    <button
                      onClick={() => handleToggleAvailable(service)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors
                        ${service.isAvailable
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                      {service.isAvailable
                        ? <><CheckCircle2 className="w-3 h-3" /> Tersedia</>
                        : <><XCircle className="w-3 h-3" /> Tidak Tersedia</>
                      }
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Kelola Jadwal */}
                      <Link to={`/provider/services/${service.id}/schedule`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                          title="Kelola Jadwal"
                        >
                          <CalendarDays className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* Hapus */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
