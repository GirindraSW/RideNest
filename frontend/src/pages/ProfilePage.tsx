import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import UserNavbar from "@/components/layout/UserNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, User, Building2, Camera } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Main Page ───────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();

  const isProvider = user?.role === "PROVIDER";

  // User form
  const [userForm, setUserForm] = useState({ name: "", phone: "" });
  const [savingUser, setSavingUser]   = useState(false);
  const [userMsg, setUserMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  // Provider form
  const [provForm, setProvForm] = useState({
    companyName: "", description: "", address: "", phone: "", logoUrl: "",
  });
  const [savingProv, setSavingProv]   = useState(false);
  const [provMsg, setProvMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    api.get<{ user: any }>("/profile").then((res) => {
      const u = res.data.user;
      setUserForm({ name: u.name ?? "", phone: u.phone ?? "" });
      if (u.provider) {
        setProvForm({
          companyName: u.provider.companyName ?? "",
          description: u.provider.description ?? "",
          address:     u.provider.address ?? "",
          phone:       u.provider.phone ?? "",
          logoUrl:     u.provider.logoUrl ?? "",
        });
        setLogoPreview(u.provider.logoUrl ?? "");
      }
    }).catch(() => navigate("/"));
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setLogoPreview(b64);
    setProvForm((f) => ({ ...f, logoUrl: b64 }));
  }

  async function handleSaveUser(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setSavingUser(true);
    setUserMsg(null);
    try {
      const res = await api.put<{ user: any }>("/profile", userForm);
      // Update Zustand + localStorage agar navbar langsung terupdate
      if (token) setAuth(res.data.user, token);
      setUserMsg({ ok: true, text: "Profil berhasil disimpan!" });
    } catch (err: any) {
      setUserMsg({ ok: false, text: err.response?.data?.message || "Gagal menyimpan" });
    } finally {
      setSavingUser(false);
    }
  }

  async function handleSaveProv(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setSavingProv(true);
    setProvMsg(null);
    try {
      await api.put("/profile/provider", provForm);
      setProvMsg({ ok: true, text: "Profil penyedia berhasil disimpan!" });
    } catch (err: any) {
      setProvMsg({ ok: false, text: err.response?.data?.message || "Gagal menyimpan" });
    } finally {
      setSavingProv(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Profil</h1>
          <p className="text-slate-500 text-sm mt-0.5">Perbarui informasi akun kamu</p>
        </div>

        {/* ── Info Pribadi ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-slate-900">Informasi Pribadi</h2>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Nama Lengkap</Label>
              <Input
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Nama lengkap"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Email <span className="text-slate-400 font-normal text-xs">(tidak bisa diubah)</span>
              </Label>
              <Input
                value={user?.email ?? ""}
                disabled
                className="h-11 bg-slate-50 text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">No. HP</Label>
              <Input
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
                className="h-11"
              />
            </div>

            {userMsg && (
              <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border
                ${userMsg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                {userMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {userMsg.text}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={savingUser}>
              {savingUser ? "Menyimpan..." : "Simpan Info Pribadi"}
            </Button>
          </form>
        </div>

        {/* ── Info Penyedia (hanya untuk PROVIDER) ── */}
        {isProvider && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-900">Profil Penyedia Layanan</h2>
            </div>

            <form onSubmit={handleSaveProv} className="space-y-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Logo Perusahaan <span className="text-slate-400 font-normal">(opsional)</span>
                </Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center bg-slate-50 shrink-0">
                    {logoPreview
                      ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      : <Camera className="w-6 h-6 text-slate-300" />
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block">
                      <span className="sr-only">Upload logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="logo-upload"
                        onChange={handleLogoUpload}
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Foto
                      </label>
                    </label>
                    <p className="text-xs text-slate-400">atau tempel URL gambar di bawah</p>
                    <Input
                      value={provForm.logoUrl}
                      onChange={(e) => { setProvForm({ ...provForm, logoUrl: e.target.value }); setLogoPreview(e.target.value); }}
                      placeholder="https://... atau kosongkan"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Nama Perusahaan / Usaha</Label>
                <Input
                  value={provForm.companyName}
                  onChange={(e) => setProvForm({ ...provForm, companyName: e.target.value })}
                  placeholder="CV. Rental Sejahtera"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Deskripsi <span className="text-slate-400 font-normal">(opsional)</span>
                </Label>
                <Textarea
                  value={provForm.description}
                  onChange={(e) => setProvForm({ ...provForm, description: e.target.value })}
                  placeholder="Ceritakan tentang usaha rental kamu..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Alamat</Label>
                <Input
                  value={provForm.address}
                  onChange={(e) => setProvForm({ ...provForm, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 1, Jakarta"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">No. HP Bisnis</Label>
                <Input
                  value={provForm.phone}
                  onChange={(e) => setProvForm({ ...provForm, phone: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  required
                  className="h-11"
                />
              </div>

              {provMsg && (
                <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border
                  ${provMsg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                  {provMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {provMsg.text}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={savingProv}>
                {savingProv ? "Menyimpan..." : "Simpan Profil Penyedia"}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
