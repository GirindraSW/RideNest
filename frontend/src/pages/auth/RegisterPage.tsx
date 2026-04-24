import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Eye, EyeOff, User, Building2 } from "lucide-react";

type Role = "USER" | "PROVIDER";

const roleOptions: { value: Role; label: string; icon: typeof User }[] = [
  { value: "USER", label: "Pengguna", icon: User },
  { value: "PROVIDER", label: "Penyedia Layanan", icon: Building2 },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "USER" as Role,
    companyName: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isProvider = form.role === "PROVIDER";

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      // Reset loading sebelum navigate agar tidak ada state update pada unmounted component
      setLoading(false);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registrasi gagal, coba lagi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-blue-600 to-indigo-700 p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">RideNest</span>
        </Link>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Bergabung dengan<br />RideNest
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Daftar sekarang dan mulai perjalananmu, atau tawarkan layanan kendaraanmu kepada ribuan pengguna.
          </p>
        </div>

        <p className="text-sm text-blue-200">Gratis · Terpercaya · Mudah digunakan</p>
      </div>

      {/* Panel kanan — form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo untuk mobile */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RideNest</span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Buat akun baru</h1>
            <p className="text-slate-500 mt-1 text-sm">Lengkapi data diri kamu di bawah ini</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors
                  ${form.role === value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Nama Lengkap</Label>
              <Input
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                No. HP <span className="text-slate-400 font-normal">(opsional)</span>
              </Label>
              <Input
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field tambahan untuk PROVIDER */}
            {isProvider && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Nama Perusahaan / Usaha</Label>
                  <Input
                    placeholder="CV. Rental Sejahtera"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">
                    Alamat <span className="text-slate-400 font-normal">(opsional)</span>
                  </Label>
                  <Input
                    placeholder="Jl. Merdeka No. 1, Jakarta"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="h-11"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 shadow-md shadow-blue-100"
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Buat Akun"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
