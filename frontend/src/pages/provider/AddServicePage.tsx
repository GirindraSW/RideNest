import { useState } from "react";
import api from "../../api/axiosInstance";
import type { VehicleCategory } from "@/types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const CATEGORIES: VehicleCategory[] = ["MOTOR", "MOBIL", "TRAVEL", "BUS"];

export default function AddServicePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "MOBIL" as VehicleCategory,
    vehicleType: "",
    pricePerDay: "",
    minDuration: "1",
    maxDuration: "",
    withDriver: false,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Travel & Bus wajib dengan driver
  const isDriverRequired =
    form.category === "TRAVEL" || form.category === "BUS";

  const handleSubmit = async (e: React.FormEvent) => {
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
      setForm({
        title: "",
        description: "",
        category: "MOBIL",
        vehicleType: "",
        pricePerDay: "",
        minDuration: "1",
        maxDuration: "",
        withDriver: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambahkan layanan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tambah Layanan Kendaraan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Judul */}
            <div className="space-y-2">
              <Label>Judul Layanan</Label>
              <Input
                placeholder="Contoh: Sewa Avanza Harian"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label>Kategori Kendaraan</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      form.category === cat
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {isDriverRequired && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                  ⚠️ Kategori {form.category} wajib menggunakan supir.
                </p>
              )}
            </div>

            {/* Tipe Kendaraan */}
            <div className="space-y-2">
              <Label>Tipe Kendaraan</Label>
              <Input
                placeholder="Contoh: Avanza, Brio, Viar, Hiace"
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                placeholder="Kondisi kendaraan, fasilitas, dll."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Harga & Durasi */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Harga/Hari (Rp)</Label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={form.pricePerDay}
                  onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Min. Hari</Label>
                <Input
                  type="number"
                  value={form.minDuration}
                  onChange={(e) => setForm({ ...form, minDuration: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Maks. Hari (opsional)</Label>
                <Input
                  type="number"
                  placeholder="Tak terbatas"
                  value={form.maxDuration}
                  onChange={(e) => setForm({ ...form, maxDuration: e.target.value })}
                  min="1"
                />
              </div>
            </div>

            {/* Dengan Supir (hanya untuk MOTOR dan MOBIL) */}
            {!isDriverRequired && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="withDriver"
                  checked={form.withDriver}
                  onChange={(e) => setForm({ ...form, withDriver: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="withDriver" className="cursor-pointer">
                  Tersedia dengan supir
                </Label>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Tambah Layanan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}