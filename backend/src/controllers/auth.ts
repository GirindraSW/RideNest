import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "SECRET_KEY"; 

// REGISTER USER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone
      }
    });

    res.status(201).json({
      message: "User berhasil dibuat",
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// REGISTER PROVIDER
export const registerProvider = async (req: Request, res: Response) => {
  try {
    const { name, email, password, companyName, address } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PROVIDER",
        provider: {
          create: {
            companyName,
            address
          }
        }
      },
      include: {
        provider: true
      }
    });

    res.status(201).json({
      message: "Provider berhasil dibuat",
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// LOGIN
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
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};