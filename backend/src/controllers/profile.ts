import { Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/profile
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        createdAt: true,
        provider: {
          select: {
            id: true, companyName: true, description: true,
            address: true, phone: true, logoUrl: true, isVerified: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/profile — update info dasar user (name, phone)
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, phone } = req.body;

    if (!name) return res.status(400).json({ message: "Nama tidak boleh kosong" });
    if (!phone) return res.status(400).json({ message: "Nomor HP tidak boleh kosong" });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    res.json({ message: "Profil berhasil diperbarui", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/profile/provider — update info provider
export const updateProviderProfile = async (req: any, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(403).json({ message: "Akun ini bukan provider" });

    const { companyName, description, address, phone, logoUrl } = req.body;

    if (!companyName) return res.status(400).json({ message: "Nama perusahaan tidak boleh kosong" });
    if (!phone) return res.status(400).json({ message: "Nomor HP bisnis tidak boleh kosong" });
    if (!address) return res.status(400).json({ message: "Alamat tidak boleh kosong" });

    const updated = await prisma.provider.update({
      where: { userId: req.user.id },
      data: {
        companyName,
        description: description || null,
        address,
        phone,
        logoUrl: logoUrl || null,
      },
    });

    res.json({ message: "Profil penyedia berhasil diperbarui", provider: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
