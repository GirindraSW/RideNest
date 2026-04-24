import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ridenest_fallback_secret";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, companyName, address } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role === "PROVIDER" ? "PROVIDER" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: normalizedRole,
        ...(normalizedRole === "PROVIDER"
          ? {
              provider: {
                create: {
                  companyName: companyName || name,
                  address: address || null,
                  phone: phone || null,
                },
              },
            }
          : {}),
      },
      include: {
        provider: true,
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
