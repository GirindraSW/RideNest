import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/me", authMiddleware, (req: any, res: any) => {
  res.json(req.user);
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
