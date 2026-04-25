import { Response } from "express";
import { prisma } from "../lib/prisma";

// Helper: pastikan layanan milik provider yang login
async function verifyOwnership(serviceId: string, userId: string, res: Response) {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) {
    res.status(403).json({ message: "Bukan provider" });
    return null;
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.providerId !== provider.id) {
    res.status(404).json({ message: "Layanan tidak ditemukan" });
    return null;
  }

  return { provider, service };
}

// GET /api/availability/:serviceId — ambil jadwal + tanggal blokir
export const getSchedule = async (req: any, res: Response) => {
  try {
    const { serviceId } = req.params;
    const owned = await verifyOwnership(serviceId, req.user.id, res);
    if (!owned) return;

    const schedule = await prisma.serviceSchedule.findUnique({
      where: { serviceId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const blockedDates = await prisma.serviceBlockedDate.findMany({
      where: {
        serviceId,
        date: { gte: today },
      },
      orderBy: { date: "asc" },
    });

    res.json({
      schedule: schedule ?? {
        mon: true, tue: true, wed: true, thu: true,
        fri: true, sat: true, sun: true,
      },
      blockedDates,
      service: owned.service,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/availability/:serviceId/weekly — simpan jadwal mingguan
export const updateWeeklySchedule = async (req: any, res: Response) => {
  try {
    const { serviceId } = req.params;
    const owned = await verifyOwnership(serviceId, req.user.id, res);
    if (!owned) return;

    const { mon, tue, wed, thu, fri, sat, sun } = req.body;

    const schedule = await prisma.serviceSchedule.upsert({
      where: { serviceId },
      update: { mon, tue, wed, thu, fri, sat, sun },
      create: { serviceId, mon, tue, wed, thu, fri, sat, sun },
    });

    res.json({ message: "Jadwal mingguan berhasil disimpan", schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// POST /api/availability/:serviceId/block — blokir tanggal tertentu
export const addBlockedDate = async (req: any, res: Response) => {
  try {
    const { serviceId } = req.params;
    const owned = await verifyOwnership(serviceId, req.user.id, res);
    if (!owned) return;

    const { date, note } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Tanggal wajib diisi" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Format tanggal tidak valid" });
    }

    const blocked = await prisma.serviceBlockedDate.create({
      data: {
        serviceId,
        date: parsedDate,
        note: note || null,
      },
    });

    res.status(201).json({ message: "Tanggal berhasil diblokir", blocked });
  } catch (error: any) {
    // Unique constraint violation — tanggal sudah diblokir
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Tanggal ini sudah diblokir" });
    }
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE /api/availability/blocked/:id — hapus blokir tanggal
export const removeBlockedDate = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const blocked = await prisma.serviceBlockedDate.findUnique({ where: { id } });
    if (!blocked) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Verifikasi kepemilikan lewat service
    const owned = await verifyOwnership(blocked.serviceId, req.user.id, res);
    if (!owned) return;

    await prisma.serviceBlockedDate.delete({ where: { id } });

    res.json({ message: "Blokir tanggal berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
