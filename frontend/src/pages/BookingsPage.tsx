import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axiosInstance";
import type { Booking, BookingStatus } from "@/types";
import UserNavbar from "@/components/layout/UserNavbar";
import { Button } from "@/components/ui/button";
import {
  Car, Bike, Bus, Navigation,
  CalendarDays, CheckCircle2, XCircle, Clock, RotateCcw, AlertCircle,
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

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  PENDING:   { label: "Menunggu",   bg: "bg-amber-100",  text: "text-amber-700",  icon: Clock },
  CONFIRMED: { label: "Dikonfirmasi", bg: "bg-green-100", text: "text-green-700",  icon: CheckCircle2 },
  CANCELLED: { label: "Dibatalkan", bg: "bg-red-100",    text: "text-red-600",    icon: XCircle },
  DONE:      { label: "Selesai",    bg: "bg-slate-100",  text: "text-slate-600",  icon: CheckCircle2 },
};

const TABS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL",       label: "Semua" },
  { value: "PENDING",   label: "Menunggu" },
  { value: "CONFIRMED", label: "Dikonfirmasi" },
  { value: "DONE",      label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

// ─── Booking Card ────────────────────────────────────────────────

function BookingCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: string | null;
}) {
  const Icon   = CAT_ICON[booking.service?.category ?? "MOBIL"] ?? Car;
  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">
              {booking.service?.title ?? "Layanan"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.service?.vehicleType} · {booking.service?.provider?.companyName}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${status.bg} ${status.text}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Detail */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Check-in</p>
          <p className="font-medium text-slate-800">{formatDate(booking.startDate)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Check-out</p>
          <p className="font-medium text-slate-800">{formatDate(booking.endDate)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Durasi</p>
          <p className="font-medium text-slate-800">{booking.totalDays} hari</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Total</p>
          <p className="font-bold text-blue-600">{formatRupiah(booking.totalPrice)}</p>
        </div>
      </div>

      {booking.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
          📝 {booking.notes}
        </p>
      )}

      {/* Aksi */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        {booking.status === "PENDING" && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1.5"
            onClick={() => onCancel(booking.id)}
            disabled={cancelling === booking.id}
          >
            <XCircle className="w-3.5 h-3.5" />
            {cancelling === booking.id ? "Membatalkan..." : "Batalkan"}
          </Button>
        )}
        {booking.service?.category && booking.serviceId && (
          <Link to={`/services/${booking.serviceId}`} className="ml-auto">
            <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600 hover:text-blue-700">
              <RotateCcw className="w-3.5 h-3.5" />
              Pesan Lagi
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    setFetching(true);
    const params = activeTab !== "ALL" ? { status: activeTab } : {};
    api
      .get<{ bookings: Booking[] }>("/bookings/my", { params })
      .then((res) => setBookings(res.data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setFetching(false));
  }, [activeTab]);

  async function handleCancel(id: string) {
    if (!confirm("Batalkan booking ini?")) return;
    setCancelling(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as BookingStatus } : b))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal membatalkan booking");
    } finally {
      setCancelling(null);
    }
  }

  const filtered = activeTab === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">Riwayat dan status pemesanan kendaraanmu</p>
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
              {value === "PENDING" && bookings.filter((b) => b.status === "PENDING").length > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">
                  {bookings.filter((b) => b.status === "PENDING").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {fetching ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-44 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center space-y-3">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-600">Belum ada booking</p>
            <Link to="/browse">
              <Button className="mt-2">Cari Kendaraan</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
