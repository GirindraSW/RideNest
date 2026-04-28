import express from "express";
import { authMiddleware } from "../middleware/auth";
import { createBooking, getMyBookings } from "../controllers/booking";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createBooking);
router.get("/my", getMyBookings);

export default router;
