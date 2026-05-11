import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import serviceRoutes from "./routes/service";
import availabilityRoutes from "./routes/availability";
import bookingRoutes from "./routes/booking";
import profileRoutes from "./routes/profile";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));       // naikan limit untuk base64 image upload
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/profile",  profileRoutes);

app.get("/api/me", authMiddleware, (req: any, res: any) => {
  res.json(req.user);
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
