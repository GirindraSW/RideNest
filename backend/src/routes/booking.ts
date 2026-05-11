import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getProviderStats,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createBooking);
router.get("/my", getMyBookings);
router.get("/provider/stats", getProviderStats); // harus sebelum /provider agar tidak terparse sebagai :id
router.get("/provider", getProviderBookings);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
