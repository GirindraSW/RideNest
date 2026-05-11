import { Response } from "express";
import { prisma } from "../lib/prisma";

function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// POST /api/bookings — buat booking baru
export const createBooking = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { serviceId, startDate, endDate, notes } = req.body;

    if (!serviceId || !startDate || !endDate) {
      return res.status(400).json({ message: "serviceId, startDate, dan endDate wajib diisi" });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Format tanggal tidak valid" });
    }
    if (start < today) {
      return res.status(400).json({ message: "Tanggal mulai tidak boleh di masa lalu" });
    }
    if (end < start) {
      return res.status(400).json({ message: "Tanggal selesai harus setelah tanggal mulai" });
    }

    // Ambil service
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isAvailable) {
      return res.status(404).json({ message: "Layanan tidak tersedia" });
    }

    // Hitung total hari (inklusif: 10 Apr – 12 Apr = 3 hari)
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

    if (totalDays < service.minDuration) {
      return res.status(400).json({ message: `Minimal sewa ${service.minDuration} hari` });
    }
    if (service.maxDuration && totalDays > service.maxDuration) {
      return res.status(400).json({ message: `Maksimal sewa ${service.maxDuration} hari` });
    }

    // Cek jadwal mingguan
    const schedule = await prisma.serviceSchedule.findUnique({ where: { serviceId } });
    if (schedule) {
      const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
      const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
      for (const date of getDatesInRange(start, end)) {
        const key = dayKeys[date.getDay()];
        if (!schedule[key]) {
          return res.status(400).json({
            message: `Layanan tidak tersedia pada hari ${dayNames[date.getDay()]}`,
          });
        }
      }
    }

    // Cek tanggal yang diblokir
    const blocked = await prisma.serviceBlockedDate.findFirst({
      where: { serviceId, date: { gte: start, lte: end } },
    });
    if (blocked) {
      return res.status(400).json({
        message: "Terdapat tanggal yang diblokir dalam rentang yang dipilih",
      });
    }

    const totalPrice = Number(service.pricePerDay) * totalDays;

    // Cek konflik + buat booking dalam satu transaksi atomik
    // Serializable memastikan tidak ada dua transaksi yang bisa
    // lolos cek konflik yang sama secara bersamaan
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          serviceId,
          status: { in: ["PENDING", "CONFIRMED"] },
          AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
        },
      });

      if (conflict) {
        throw new Error("CONFLICT");
      }

      return tx.booking.create({
        data: {
          userId,
          serviceId,
          startDate: start,
          endDate:   end,
          totalDays,
          totalPrice,
          notes: notes || null,
          status: "PENDING",
        },
        include: {
          service: {
            select: {
              title: true,
              vehicleType: true,
              category: true,
              provider: { select: { companyName: true } },
            },
          },
        },
      });
    }, {
      isolationLevel: "Serializable",
      maxWait: 5000,  // tunggu maksimal 5 detik jika transaksi lain sedang berjalan
      timeout: 10000, // transaksi harus selesai dalam 10 detik
    });

    res.status(201).json({ message: "Booking berhasil dibuat", booking });
  } catch (error: any) {
    // Error dari dalam transaksi — konflik tanggal
    if (error.message === "CONFLICT") {
      return res.status(409).json({
        message: "Kendaraan sudah dibooking pada rentang tanggal tersebut",
      });
    }
    // PostgreSQL: transaksi serializable gagal karena konflik concurrent
    if (error.code === "P2034") {
      return res.status(409).json({
        message: "Booking gagal karena ada pemesanan bersamaan. Silakan coba lagi.",
      });
    }
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/bookings/my — daftar booking milik user yang login
export const getMyBookings = async (req: any, res: Response) => {
  try {
    const { status } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
        ...(status ? { status: String(status) } : {}),
      },
      include: {
        service: {
          select: {
            title: true,
            vehicleType: true,
            category: true,
            pricePerDay: true,
            imageUrl: true,
            provider: { select: { companyName: true, isVerified: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/bookings/provider — semua booking untuk layanan milik provider
export const getProviderBookings = async (req: any, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(403).json({ message: "Bukan provider" });

    const { status } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        service: { providerId: provider.id },
        ...(status ? { status: String(status) } : {}),
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        service: { select: { id: true, title: true, category: true, vehicleType: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/bookings/provider/stats — ringkasan statistik untuk dashboard provider
export const getProviderStats = async (req: any, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(403).json({ message: "Bukan provider" });

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [totalBookings, pendingCount, monthlyRevenue, activeServices] = await Promise.all([
      prisma.booking.count({ where: { service: { providerId: provider.id } } }),
      prisma.booking.count({ where: { service: { providerId: provider.id }, status: "PENDING" } }),
      prisma.booking.aggregate({
        where: {
          service: { providerId: provider.id },
          status: "CONFIRMED",
          createdAt: { gte: firstDayOfMonth },
        },
        _sum: { totalPrice: true },
      }),
      prisma.service.count({ where: { providerId: provider.id, isAvailable: true } }),
    ]);

    res.json({
      totalBookings,
      pendingCount,
      monthlyRevenue: Number(monthlyRevenue._sum.totalPrice) || 0,
      activeServices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PATCH /api/bookings/:id/status — provider ubah status (CONFIRMED/CANCELLED/DONE)
export const updateBookingStatus = async (req: any, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(403).json({ message: "Bukan provider" });

    const { id } = req.params;
    const { status } = req.body;

    if (!["CONFIRMED", "CANCELLED", "DONE"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!booking || booking.service.providerId !== provider.id) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `Booking diupdate ke ${status}`, booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PATCH /api/bookings/:id/cancel — user batalkan booking miliknya sendiri
export const cancelBooking = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.userId !== req.user.id) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Hanya booking PENDING yang bisa dibatalkan" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Booking berhasil dibatalkan", booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
