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

    // Cek konflik booking yang sudah ada
    const conflict = await prisma.booking.findFirst({
      where: {
        serviceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
      },
    });
    if (conflict) {
      return res.status(409).json({
        message: "Kendaraan sudah dibooking pada rentang tanggal tersebut",
      });
    }

    const totalPrice = Number(service.pricePerDay) * totalDays;

    const booking = await prisma.booking.create({
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

    res.status(201).json({ message: "Booking berhasil dibuat", booking });
  } catch (error) {
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
