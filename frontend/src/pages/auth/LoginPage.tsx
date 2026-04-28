import { useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/api/axiosInstance";
import type { AuthResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post<AuthResponse>("/auth/login", form);
      setAuth(res.data.user, res.data.token);
      flushSync(() => setLoading(false));
      if (res.data.user.role === "PROVIDER") {
        navigate("/provider/services");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal, coba lagi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri — hanya tampil di layar besar */}
      <div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-blue-600 to-indigo-700 p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">RideNest</span>
        </Link>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Selamat datang<br />kembali!
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Masuk untuk melanjutkan perjalananmu bersama RideNest.
          </p>
        </div>

        <p className="text-sm text-blue-200">
          Platform rental kendaraan terpercaya di Indonesia.
        </p>
      </div>

      {/* Panel kanan — form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo untuk mobile */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RideNest</span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Masuk ke akun</h1>
            <p className="text-slate-500 mt-1 text-sm">Masukkan email dan password kamu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
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

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 shadow-md shadow-blue-100" disabled={loading}>
              {loading ? "Memuat..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
