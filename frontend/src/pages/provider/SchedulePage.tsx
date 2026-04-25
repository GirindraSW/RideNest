import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import type { ServiceSchedule, ServiceBlockedDate, ScheduleResponse, Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Car, ArrowLeft, ChevronLeft, ChevronRight,
  CalendarX2, CheckCircle2, XCircle, Save, Trash2, AlertCircle,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAYS: { key: keyof ServiceSchedule; label: string; short: string }[] = [
  { key: "mon", label: "Senin",  short: "Sen" },
  { key: "tue", label: "Selasa", short: "Sel" },
  { key: "wed", label: "Rabu",   short: "Rab" },
  { key: "thu", label: "Kamis",  short: "Kam" },
  { key: "fri", label: "Jumat",  short: "Jum" },
  { key: "sat", label: "Sabtu",  short: "Sab" },
  { key: "sun", label: "Minggu", short: "Min" },
];

const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function toLocalDateStr(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

// ─── Mini Calendar ───────────────────────────────────────────────────────────

function MiniCalendar({
  year, month, blockedSet,
  onPrev, onNext,
}: {
  year: number; month: number;
  blockedSet: Set<string>;
  onPrev: () => void; onNext: () => void;
}) {
  const today = toLocalDateStr(new Date());

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const offset = firstDow === 0 ? 6 : firstDow - 1;  // shift to Mon-start
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrev}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={onNext}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Se","Se","Ra","Ka","Ju","Sa","Mi"].map((d, i) => (
          <div key={i} className="text-center text-xs text-slate-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isBlocked = blockedSet.has(dateStr);
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className={`text-center text-xs py-1.5 rounded-lg font-medium transition-colors
                ${isBlocked
                  ? "bg-red-500 text-white"
                  : isToday
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Diblokir
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-100 inline-block" /> Hari ini
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [schedule, setSchedule] = useState<ServiceSchedule>({
    mon: true, tue: true, wed: true, thu: true,
    fri: true, sat: true, sun: true,
  });
  const [blockedDates, setBlockedDates] = useState<ServiceBlockedDate[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form blokir tanggal
  const [newDate, setNewDate]   = useState("");
  const [newNote, setNewNote]   = useState("");
  const [addingDate, setAddingDate] = useState(false);
  const [addError, setAddError] = useState("");

  // Simpan jadwal mingguan
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleMsg, setScheduleMsg]       = useState("");

  // Hapus blokir
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Kalender mini
  const now = new Date();
  const [calYear, setCalYear]   = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const blockedSet = useMemo(
    () => new Set(blockedDates.map((b) => toLocalDateStr(b.date))),
    [blockedDates]
  );

  useEffect(() => {
    if (!serviceId) return;
    setFetching(true);
    api.get<ScheduleResponse>(`/availability/${serviceId}`)
      .then((res) => {
        setService(res.data.service);
        setSchedule(res.data.schedule);
        setBlockedDates(res.data.blockedDates);
      })
      .catch(() => navigate("/provider/services"))
      .finally(() => setFetching(false));
  }, [serviceId]);

  async function handleSaveSchedule() {
    if (!serviceId) return;
    setSavingSchedule(true);
    setScheduleMsg("");
    try {
      await api.put(`/availability/${serviceId}/weekly`, schedule);
      setScheduleMsg("Jadwal berhasil disimpan!");
      setTimeout(() => setScheduleMsg(""), 3000);
    } catch {
      setScheduleMsg("Gagal menyimpan jadwal.");
    } finally {
      setSavingSchedule(false);
    }
  }

  async function handleAddBlockedDate(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!serviceId || !newDate) return;
    setAddingDate(true);
    setAddError("");
    try {
      const res = await api.post<{ blocked: ServiceBlockedDate }>(
        `/availability/${serviceId}/block`,
        { date: newDate, note: newNote || undefined }
      );
      setBlockedDates((prev) =>
        [...prev, res.data.blocked].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      setNewDate("");
      setNewNote("");
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Gagal memblokir tanggal");
    } finally {
      setAddingDate(false);
    }
  }

  async function handleRemoveBlocked(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/availability/blocked/${id}`);
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Gagal menghapus blokir tanggal");
    } finally {
      setDeletingId(null);
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  const today = toLocalDateStr(new Date());

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Memuat jadwal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 hidden sm:block">RideNest</span>
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
          <span className="text-sm font-medium text-slate-900 truncate">
            {service?.title ?? "Kelola Jadwal"}
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Jadwal Ketersediaan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Atur hari aktif dan blokir tanggal tertentu untuk{" "}
            <span className="font-medium text-slate-700">{service?.title}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom kiri — jadwal mingguan + form blokir */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Jadwal Mingguan ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Jadwal Mingguan</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Pilih hari-hari kendaraan ini tersedia untuk disewa.
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {DAYS.map(({ key, label, short }) => {
                  const active = !!schedule[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      title={label}
                      onClick={() => setSchedule({ ...schedule, [key]: !active })}
                      className={`flex flex-col items-center py-3 rounded-xl border-2 text-xs font-medium transition-colors
                        ${active
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                    >
                      <span>{short}</span>
                      {active
                        ? <CheckCircle2 className="w-3.5 h-3.5 mt-1" />
                        : <XCircle className="w-3.5 h-3.5 mt-1 opacity-40" />
                      }
                    </button>
                  );
                })}
              </div>

              {scheduleMsg && (
                <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border
                  ${scheduleMsg.includes("berhasil")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600"
                  }`}>
                  {scheduleMsg.includes("berhasil")
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />
                  }
                  {scheduleMsg}
                </div>
              )}

              <Button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {savingSchedule ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
            </div>

            {/* ── Blokir Tanggal ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Blokir Tanggal</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Tandai tanggal tertentu sebagai tidak tersedia (servis, libur, dll).
                </p>
              </div>

              {/* Form tambah blokir */}
              <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-slate-500">Tanggal</Label>
                  <Input
                    type="date"
                    value={newDate}
                    min={today}
                    onChange={(e) => { setNewDate(e.target.value); setAddError(""); }}
                    required
                    className="h-10"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-slate-500">
                    Keterangan <span className="text-slate-400">(opsional)</span>
                  </Label>
                  <Input
                    placeholder="Servis rutin, hari libur..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={addingDate || !newDate}
                    className="h-10 gap-2 whitespace-nowrap"
                  >
                    <CalendarX2 className="w-4 h-4" />
                    {addingDate ? "Menyimpan..." : "Blokir"}
                  </Button>
                </div>
              </form>

              {addError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {addError}
                </div>
              )}

              {/* Daftar tanggal yang diblokir */}
              {blockedDates.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                  Belum ada tanggal yang diblokir.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {blockedDates.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between py-3 gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                          <CalendarX2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {formatDisplayDate(toLocalDateStr(b.date))}
                          </p>
                          {b.note && (
                            <p className="text-xs text-slate-500">{b.note}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                        onClick={() => handleRemoveBlocked(b.id)}
                        disabled={deletingId === b.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kolom kanan — kalender mini */}
          <div className="space-y-4">
            <MiniCalendar
              year={calYear}
              month={calMonth}
              blockedSet={blockedSet}
              onPrev={prevMonth}
              onNext={nextMonth}
            />

            {/* Ringkasan jadwal aktif */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Hari Aktif</h3>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map(({ key, short }) => (
                  <div
                    key={key}
                    className={`text-center text-xs py-1.5 rounded-lg font-medium
                      ${schedule[key]
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                      }`}
                  >
                    {short}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                {DAYS.filter(({ key }) => schedule[key]).length} dari 7 hari aktif
              </p>
            </div>

            {/* Info blokir */}
            {blockedDates.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  {blockedDates.length} tanggal diblokir
                </p>
                <p className="text-xs text-red-500">
                  Pengguna tidak bisa booking pada tanggal yang ditandai merah di kalender.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
