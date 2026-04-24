import { Response } from "express";
import { prisma } from "../lib/prisma";

// Helper: ambil provider dari userId JWT
async function getProvider(userId: string, res: Response) {
  const provider = await prisma.provider.findUnique({ where: { userId } });
  if (!provider) {
    res.status(403).json({ message: "Akun ini bukan provider" });
    return null;
  }
  return provider;
}

// POST /api/services — tambah layanan baru
export const createService = async (req: any, res: Response) => {
  try {
    const provider = await getProvider(req.user.id, res);
    if (!provider) return;

    const { title, description, category, vehicleType, pricePerDay, minDuration, maxDuration, withDriver } = req.body;

    if (!title || !category || !vehicleType || !pricePerDay) {
      return res.status(400).json({ message: "Judul, kategori, tipe kendaraan, dan harga wajib diisi" });
    }

    const validCategories = ["MOTOR", "MOBIL", "TRAVEL", "BUS"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Kategori tidak valid" });
    }

    // Travel & Bus wajib dengan supir
    const mustHaveDriver = category === "TRAVEL" || category === "BUS";

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        title,
        description: description || null,
        category,
        vehicleType,
        pricePerDay: parseFloat(String(pricePerDay)),
        minDuration: parseInt(String(minDuration)) || 1,
        maxDuration: maxDuration ? parseInt(String(maxDuration)) : null,
        withDriver: mustHaveDriver ? true : Boolean(withDriver),
      },
    });

    res.status(201).json({ message: "Layanan berhasil ditambahkan", service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/services/my — daftar layanan milik provider yang login
export const getMyServices = async (req: any, res: Response) => {
  try {
    const provider = await getProvider(req.user.id, res);
    if (!provider) return;

    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/services/:id — update layanan
export const updateService = async (req: any, res: Response) => {
  try {
    const provider = await getProvider(req.user.id, res);
    if (!provider) return;

    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });

    if (!existing || existing.providerId !== provider.id) {
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    }

    const { title, description, category, vehicleType, pricePerDay, minDuration, maxDuration, withDriver, isAvailable } = req.body;

    const mustHaveDriver = (category || existing.category) === "TRAVEL" || (category || existing.category) === "BUS";

    const updated = await prisma.service.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        category: category ?? existing.category,
        vehicleType: vehicleType ?? existing.vehicleType,
        pricePerDay: pricePerDay !== undefined ? parseFloat(String(pricePerDay)) : existing.pricePerDay,
        minDuration: minDuration !== undefined ? parseInt(String(minDuration)) : existing.minDuration,
        maxDuration: maxDuration !== undefined ? (maxDuration ? parseInt(String(maxDuration)) : null) : existing.maxDuration,
        withDriver: mustHaveDriver ? true : (withDriver !== undefined ? Boolean(withDriver) : existing.withDriver),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable,
      },
    });

    res.json({ message: "Layanan berhasil diperbarui", service: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE /api/services/:id — hapus layanan
export const deleteService = async (req: any, res: Response) => {
  try {
    const provider = await getProvider(req.user.id, res);
    if (!provider) return;

    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });

    if (!existing || existing.providerId !== provider.id) {
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    }

    await prisma.service.delete({ where: { id } });

    res.json({ message: "Layanan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
