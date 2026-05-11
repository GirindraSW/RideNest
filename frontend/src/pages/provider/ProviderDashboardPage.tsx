import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import type { Booking, BookingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Car, Bike, Bus, Navigation,
  CalendarDays, CheckCircle2, XCircle, Clock,
  TrendingUp, Package, LogOut, LayoutDashboard, List,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function formatDate(str: string) {
  const d = new Date(str);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRupiah(v: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(Number(v));
}

const CAT_ICON: Record<string, typeof Car> = {
  MOTOR: Bike, MOBIL: Car, TRAVEL: Navigation, BUS: Bus,
};

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  PENDING:   { label: "Menunggu",     bg: "bg-amber-100",  text: "text-amber-700",  icon: Clock },
  CONFIRMED: { label: "Dikonfirmasi", bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
  CANCELLED: { label: "Dibatalkan",   bg: "bg-red-100",    text: "text-red-600",    icon: XCircle },
  DONE:      { label: "Selesai",      bg: "bg-slate-100",  text: "text-slate-600",  icon: CheckCircle2 },
};

interface Stats {
  totalBookings: number;
  pendingCount: number;
  monthlyRevenue: number;
  activeServices: number;
}

interface ProviderBooking extends Booking {
  user?: { name: string; email: string; phone?: string };
}

const TABS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL",       label: "Semua" },
  { value: "PENDING",   label: "Menunggu" },
  { value: "CONFIRMED", label: "Aktif" },
  { value: "DONE",      label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

// ─── Stat Card ───────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: typeof Car; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function ProviderDashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats]       = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [fetching, setFetching]   = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Stats>("/bookings/provider/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFetching(true);
    const params = activeTab !== "ALL" ? { status: activeTab } : {};
    api
      .get<{ bookings: ProviderBooking[] }>("/bookings/provider", { params })
      .then((res) => setBookings(res.data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setFetching(false));
  }, [activeTab]);

  async function handleStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      if (stats) {
        setStats({
          ...stats,
          pendingCount: stats.pendingCount - (status !== "PENDING" ? 1 : 0),
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengupdate status");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const filtered = activeTab === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 hidden sm:block">RideNest</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link to="/provider/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:block">Dashboard</span>
              </Button>
            </Link>
            <Link to="/provider/services">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <List className="w-4 h-4" />
                <span className="hidden sm:block">Layanan</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-slate-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Selamat datang, <span className="font-medium">{user?.name}</span>
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={CalendarDays}
              label="Total Booking"
              value={String(stats.totalBookings)}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={Clock}
              label="Menunggu Konfirmasi"
              value={String(stats.pendingCount)}
              sub={stats.pendingCount > 0 ? "Perlu ditindaklanjuti" : undefined}
              color="bg-amber-100 text-amber-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Pendapatan Bulan Ini"
              value={formatRupiah(stats.monthlyRevenue)}
              sub="Booking confirmed"
              color="bg-green-100 text-green-600"
            />
            <StatCard
              icon={Package}
              label="Layanan Aktif"
              value={String(stats.activeServices)}
              color="bg-purple-100 text-purple-600"
            />
          </div>
        )}

        {/* Booking list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-lg">Daftar Booking</h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${activeTab === value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
              >
                {label}
                {value === "PENDING" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Cards */}
          {fetching ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 h-36 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-12 text-center">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Belum ada booking di kategori ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => {
                const Icon = CAT_ICON[booking.service?.category ?? "MOBIL"] ?? Car;
                const st   = STATUS_CONFIG[booking.status];
                const StIcon = st.icon;
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {booking.service?.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.user?.name} · {booking.user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Tanggal & harga */}
                      <div className="flex items-center gap-6 text-sm shrink-0">
                        <div>
                          <p className="text-slate-400 text-xs">Tanggal</p>
                          <p className="font-medium text-slate-800">
                            {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Total</p>
                          <p className="font-bold text-slate-900">{formatRupiah(booking.totalPrice)}</p>
                        </div>
                      </div>

                      {/* Status + aksi */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                          <StIcon className="w-3 h-3" />
                          {st.label}
                        </span>

                        {booking.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatus(booking.id, "CONFIRMED")}
                              disabled={updatingId === booking.id}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Konfirmasi
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatus(booking.id, "CANCELLED")}
                              disabled={updatingId === booking.id}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </Button>
                          </>
                        )}

                        {booking.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => handleStatus(booking.id, "DONE")}
                            disabled={updatingId === booking.id}
                          >
                            Tandai Selesai
                          </Button>
                        )}
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mt-3">
                        📝 {booking.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
