import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import type { ServiceDetailResponse, ServiceSchedule, ServiceBlockedDate, BookingRange } from "@/types";
import UserNavbar from "@/components/layout/UserNavbar";
import { Button } from "@/components/ui/button";
import {
  Car, Bike, Bus, Navigation, BadgeCheck, ChevronLeft, ChevronRight,
  CalendarDays, Clock, Users, MapPin, AlertCircle, CheckCircle2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────

const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"];

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

const CAT_ICON = { MOTOR: Bike, MOBIL: Car, TRAVEL: Navigation, BUS: Bus };
const CAT_COLOR: Record<string, { bg: string; text: string }> = {
  MOTOR:  { bg: "bg-orange-100", text: "text-orange-700" },
  MOBIL:  { bg: "bg-blue-100",   text: "text-blue-700" },
  TRAVEL: { bg: "bg-green-100",  text: "text-green-700" },
  BUS:    { bg: "bg-purple-100", text: "text-purple-700" },
};

function toLocalStr(d: Date | string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}

function formatDisplay(str: string) {
  const [y,m,d] = str.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m)-1]} ${y}`;
}

function formatRupiah(v: number | string) {
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(Number(v));
}

// ─── Booking Calendar ────────────────────────────────────────────

interface CalendarProps {
  schedule: ServiceSchedule;
  blockedDates: ServiceBlockedDate[];
  existingBookings: BookingRange[];
  selectedStart: string | null;
  selectedEnd:   string | null;
  onSelectStart: (d: string) => void;
  onSelectEnd:   (d: string) => void;
}

function BookingCalendar({
  schedule, blockedDates, existingBookings,
  selectedStart, selectedEnd, onSelectStart, onSelectEnd,
}: CalendarProps) {
  const today = toLocalStr(new Date());
  const now   = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [hover, setHover] = useState<string | null>(null);

  const blockedSet = useMemo(
    () => new Set(blockedDates.map((b) => toLocalStr(b.date))),
    [blockedDates]
  );

  const bookedSet = useMemo(() => {
    const s = new Set<string>();
    existingBookings.forEach(({ startDate, endDate }) => {
      const cur = new Date(startDate);
      cur.setHours(0,0,0,0);
      const end = new Date(endDate);
      end.setHours(0,0,0,0);
      while (cur <= end) { s.add(toLocalStr(cur)); cur.setDate(cur.getDate()+1); }
    });
    return s;
  }, [existingBookings]);

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const offset   = firstDow === 0 ? 6 : firstDow - 1;
    const total    = new Date(year, month+1, 0).getDate();
    const arr: (number|null)[] = Array(offset).fill(null);
    for (let d=1; d<=total; d++) arr.push(d);
    return arr;
  }, [year, month]);

  function isAvailable(dateStr: string) {
    if (dateStr < today) return false;
    const dayKey = DAY_KEYS[new Date(dateStr+"T00:00:00").getDay()];
    if (!(schedule as any)[dayKey]) return false;
    if (blockedSet.has(dateStr)) return false;
    if (bookedSet.has(dateStr))  return false;
    return true;
  }

  function isInRange(dateStr: string) {
    const ref = hover && !selectedEnd ? hover : selectedEnd;
    if (!selectedStart || !ref) return false;
    const lo = selectedStart < ref ? selectedStart : ref;
    const hi = selectedStart < ref ? ref : selectedStart;
    return dateStr > lo && dateStr < hi;
  }

  function handleClick(dateStr: string) {
    if (!isAvailable(dateStr)) return;
    if (!selectedStart || (selectedStart && selectedEnd)) {
      onSelectStart(dateStr);
      onSelectEnd("");
    } else {
      if (dateStr < selectedStart) {
        onSelectStart(dateStr);
      } else {
        onSelectEnd(dateStr);
      }
    }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y-1); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y+1); }
    else setMonth(m => m+1);
  }

  return (
    <div className="select-none">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="font-semibold text-slate-900">{MONTH_NAMES[month]} {year}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d) => (
          <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const avail   = isAvailable(dateStr);
          const isStart = dateStr === selectedStart;
          const isEnd   = dateStr === selectedEnd;
          const inRange = isInRange(dateStr);
          const isToday = dateStr === today;
          const isBlocked = blockedSet.has(dateStr) || bookedSet.has(dateStr);

          let cellClass = "text-center text-sm py-2 cursor-pointer rounded-lg transition-colors font-medium ";

          if (!avail) {
            cellClass += isBlocked
              ? "text-red-400 bg-red-50 cursor-not-allowed"
              : "text-slate-300 cursor-not-allowed";
          } else if (isStart || isEnd) {
            cellClass += "bg-blue-600 text-white shadow-sm";
          } else if (inRange) {
            cellClass += "bg-blue-100 text-blue-800";
          } else if (isToday) {
            cellClass += "ring-2 ring-blue-400 text-blue-700 hover:bg-blue-50";
          } else {
            cellClass += "text-slate-700 hover:bg-blue-50";
          }

          return (
            <div
              key={i}
              className={cellClass}
              onClick={() => handleClick(dateStr)}
              onMouseEnter={() => avail && setHover(dateStr)}
              onMouseLeave={() => setHover(null)}
              title={isBlocked ? "Tanggal tidak tersedia" : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"/> Dipilih
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-100 inline-block"/> Rentang
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-100 inline-block"/> Tidak tersedia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-100 inline-block"/> Hari libur
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [data, setData] = useState<ServiceDetailResponse | null>(null);
  const [fetching, setFetching] = useState(true);

  const [selectedStart, setSelectedStart] = useState<string>("");
  const [selectedEnd,   setSelectedEnd]   = useState<string>("");
  const [notes,  setNotes]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError]   = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<ServiceDetailResponse>(`/services/${id}/detail`)
      .then((res) => setData(res.data))
      .catch(() => navigate("/browse"))
      .finally(() => setFetching(false));
  }, [id]);

  const totalDays = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    const diff = new Date(selectedEnd).getTime() - new Date(selectedStart).getTime();
    return Math.round(diff / 86_400_000) + 1;
  }, [selectedStart, selectedEnd]);

  const totalPrice = useMemo(() => {
    if (!data || totalDays <= 0) return 0;
    return totalDays * Number(data.service.pricePerDay);
  }, [data, totalDays]);

  async function handleBooking() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (!selectedStart || !selectedEnd) return;
    setSubmitting(true);
    setBookingError("");
    try {
      await api.post("/bookings", {
        serviceId: id,
        startDate: selectedStart,
        endDate:   selectedEnd,
        notes: notes || undefined,
      });
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(err.response?.data?.message || "Gagal membuat booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Memuat...
      </div>
    );
  }

  if (!data) return null;

  const { service, schedule, blockedDates, existingBookings } = data;
  const Icon    = CAT_ICON[service.category] ?? Car;
  const catCol  = CAT_COLOR[service.category];
  const minOk   = totalDays >= service.minDuration;
  const maxOk   = !service.maxDuration || totalDays <= service.maxDuration;
  const canBook = selectedStart && selectedEnd && totalDays > 0 && minOk && maxOk;

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Berhasil!</h2>
          <p className="text-slate-500">
            Booking <span className="font-medium text-slate-700">{service.title}</span> dari{" "}
            <span className="font-medium">{formatDisplay(selectedStart)}</span> s/d{" "}
            <span className="font-medium">{formatDisplay(selectedEnd)}</span> berhasil dibuat.
            Status saat ini: <span className="font-semibold text-amber-600">PENDING</span>.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/bookings">
              <Button className="w-full">Lihat Booking Saya</Button>
            </Link>
            <Link to="/browse">
              <Button variant="outline" className="w-full">Kembali Cari Kendaraan</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/browse" className="hover:text-blue-600 transition-colors">Cari Kendaraan</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium truncate">{service.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Kolom kiri: info layanan ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Foto kendaraan */}
            <div className="bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl h-56 flex items-center justify-center overflow-hidden">
              {service.imageUrl
                ? <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                : <Icon className="w-24 h-24 text-slate-300" />
              }
            </div>

            {/* Info utama */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${catCol.bg} ${catCol.text} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catCol.bg} ${catCol.text}`}>
                      {service.category}
                    </span>
                    {service.withDriver && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Dengan Supir
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">{service.title}</h1>
                  <p className="text-slate-500 text-sm">{service.vehicleType}</p>
                </div>
              </div>

              {service.description && (
                <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  Min. {service.minDuration} hari
                  {service.maxDuration && ` — Maks. ${service.maxDuration} hari`}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {formatRupiah(service.pricePerDay)} / hari
                </div>
              </div>
            </div>

            {/* Info provider */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{service.provider.companyName}</p>
                {service.provider.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-600" />
                )}
              </div>
              {service.provider.address && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {service.provider.address}
                </p>
              )}
              {service.provider.description && (
                <p className="text-sm text-slate-500">{service.provider.description}</p>
              )}
            </div>
          </div>

          {/* ── Kolom kanan: booking panel ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-24">
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatRupiah(service.pricePerDay)}</p>
                <p className="text-sm text-slate-400">per hari</p>
              </div>

              {/* Kalender */}
              <BookingCalendar
                schedule={schedule}
                blockedDates={blockedDates}
                existingBookings={existingBookings}
                selectedStart={selectedStart || null}
                selectedEnd={selectedEnd || null}
                onSelectStart={setSelectedStart}
                onSelectEnd={setSelectedEnd}
              />

              {/* Tanggal yang dipilih */}
              {selectedStart && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-medium">{formatDisplay(selectedStart)}</span>
                  </div>
                  {selectedEnd && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Check-out</span>
                      <span className="font-medium">{formatDisplay(selectedEnd)}</span>
                    </div>
                  )}
                  {selectedEnd && totalDays > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Durasi</span>
                        <span className="font-medium">{totalDays} hari</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="font-bold text-blue-600 text-base">
                          {formatRupiah(totalPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Validasi durasi */}
              {selectedEnd && totalDays > 0 && !minOk && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Minimal sewa {service.minDuration} hari (dipilih {totalDays} hari)
                </div>
              )}
              {selectedEnd && totalDays > 0 && !maxOk && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Maksimal sewa {service.maxDuration} hari (dipilih {totalDays} hari)
                </div>
              )}

              {/* Catatan */}
              {selectedEnd && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-medium">
                    Catatan <span className="font-normal">(opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Alamat penjemputan, permintaan khusus..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Error */}
              {bookingError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {bookingError}
                </div>
              )}

              <Button
                className="w-full h-11"
                disabled={!canBook || submitting}
                onClick={handleBooking}
              >
                {submitting
                  ? "Memproses..."
                  : !isAuthenticated()
                    ? "Masuk untuk Booking"
                    : !selectedStart
                      ? "Pilih Tanggal Mulai"
                      : !selectedEnd
                        ? "Pilih Tanggal Selesai"
                        : "Buat Booking"}
              </Button>

              <p className="text-xs text-center text-slate-400">
                Booking statusnya PENDING sampai dikonfirmasi penyedia.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
