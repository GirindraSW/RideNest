import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import type { Service, VehicleCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Car, Bike, Bus, Navigation, ArrowLeft,
  CheckCircle2, AlertCircle, Camera, X,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────

const CATEGORIES: { value: VehicleCategory; label: string; icon: typeof Car }[] = [
  { value: "MOTOR",  label: "Motor",  icon: Bike },
  { value: "MOBIL",  label: "Mobil",  icon: Car },
  { value: "TRAVEL", label: "Travel", icon: Navigation },
  { value: "BUS",    label: "Bus",    icon: Bus },
];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Main Page ───────────────────────────────────────────────────

export default function EditServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", category: "MOBIL" as VehicleCategory,
    vehicleType: "", pricePerDay: "", minDuration: "1", maxDuration: "",
    withDriver: false, imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const isDriverRequired = form.category === "TRAVEL" || form.category === "BUS";

  useEffect(() => {
    if (!serviceId) return;
    api.get<{ services: Service[] }>("/services/my").then((res) => {
      const svc = res.data.services.find((s) => s.id === serviceId);
      if (!svc) { navigate("/provider/services"); return; }
      setForm({
        title:        svc.title,
        description:  svc.description ?? "",
        category:     svc.category,
        vehicleType:  svc.vehicleType,
        pricePerDay:  String(svc.pricePerDay),
        minDuration:  String(svc.minDuration),
        maxDuration:  svc.maxDuration ? String(svc.maxDuration) : "",
        withDriver:   svc.withDriver,
        imageUrl:     svc.imageUrl ?? "",
      });
      setImagePreview(svc.imageUrl ?? "");
    }).catch(() => navigate("/provider/services"))
      .finally(() => setLoading(false));
  }, [serviceId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImagePreview(b64);
    setForm((f) => ({ ...f, imageUrl: b64 }));
  }

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/services/${serviceId}`, {
        ...form,
        pricePerDay:  parseFloat(form.pricePerDay),
        minDuration:  parseInt(form.minDuration),
        maxDuration:  form.maxDuration ? parseInt(form.maxDuration) : null,
        withDriver:   isDriverRequired ? true : form.withDriver,
        imageUrl:     form.imageUrl || null,
      });
      setSuccess("Layanan berhasil diperbarui!");
      setTimeout(() => navigate("/provider/services"), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            to="/provider/services"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Layanan Saya
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-900 truncate">Edit Layanan</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h1 className="font-semibold text-slate-900 text-xl">Edit Layanan</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Foto Kendaraan */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Foto Kendaraan <span className="text-slate-400 font-normal">(opsional)</span>
              </Label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(""); setForm((f) => ({ ...f, imageUrl: "" })); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="img-upload"
                    className="flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Camera className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Klik untuk upload foto</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (maks 5MB)</p>
                  </label>
                )}
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-xs text-slate-400">Atau tempel URL gambar:</p>
              <Input
                value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) => { setForm((f) => ({ ...f, imageUrl: e.target.value })); setImagePreview(e.target.value); }}
                placeholder="https://example.com/foto-kendaraan.jpg"
                className="h-10 text-sm"
              />
            </div>

            {/* Judul */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Judul Layanan</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Sewa Avanza Harian"
                required
                className="h-11"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Kategori</Label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, category: value })}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-colors
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

            {/* Tipe kendaraan */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Tipe Kendaraan</Label>
              <Input
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                placeholder="Avanza, Brio, Viar, Hiace..."
                required
                className="h-11"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Deskripsi <span className="text-slate-400 font-normal">(opsional)</span>
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Kondisi kendaraan, fasilitas, catatan penting..."
                rows={3}
              />
            </div>

            {/* Harga & Durasi */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Harga/Hari (Rp)</Label>
                <Input
                  type="number" min="0"
                  value={form.pricePerDay}
                  onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                  required className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Min. Hari</Label>
                <Input
                  type="number" min="1"
                  value={form.minDuration}
                  onChange={(e) => setForm({ ...form, minDuration: e.target.value })}
                  required className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Maks. Hari <span className="text-xs text-slate-400">(opt)</span>
                </Label>
                <Input
                  type="number" min="1"
                  value={form.maxDuration}
                  onChange={(e) => setForm({ ...form, maxDuration: e.target.value })}
                  placeholder="∞" className="h-11"
                />
              </div>
            </div>

            {/* Dengan supir */}
            {!isDriverRequired && (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm({ ...form, withDriver: !form.withDriver })}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1
                    ${form.withDriver ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform
                    ${form.withDriver ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-slate-700 font-medium">Tersedia dengan supir</span>
              </label>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" className="flex-1 h-11" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Link to="/provider/services">
                <Button type="button" variant="outline" className="h-11">Batal</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
