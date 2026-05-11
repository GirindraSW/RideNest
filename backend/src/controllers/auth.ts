import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ridenest_fallback_secret";

// REGISTER — menangani USER dan PROVIDER dalam satu endpoint
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, companyName, address } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Nama, email, password, dan nomor HP wajib diisi" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "PROVIDER") {
      if (!companyName || !address) {
        return res.status(400).json({ message: "Nama perusahaan dan alamat wajib diisi untuk penyedia layanan" });
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: "PROVIDER",
          provider: {
            create: {
              companyName,
              address: address || null,
            },
          },
        },
        include: { provider: true },
      });

      const { password: _, ...safeUser } = user;
      return res.status(201).json({ message: "Provider berhasil didaftarkan", user: safeUser });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
    });

    const { password: _, ...safeUser } = user;
    return res.status(201).json({ message: "User berhasil didaftarkan", user: safeUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...safeUser } = user;

    res.json({
      message: "Login berhasil",
      token,
      user: safeUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
