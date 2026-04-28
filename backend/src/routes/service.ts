import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getPublicServices,
  getPublicServiceById,
  createService,
  getMyServices,
  updateService,
  deleteService,
} from "../controllers/service";

const router = express.Router();

// ── Public routes (tidak perlu login) ──────────────────────────
router.get("/", getPublicServices);
router.get("/:id/detail", getPublicServiceById);

// ── Protected routes (perlu login) ─────────────────────────────
router.use(authMiddleware);

router.post("/", createService);
router.get("/my", getMyServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
