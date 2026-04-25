import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getSchedule,
  updateWeeklySchedule,
  addBlockedDate,
  removeBlockedDate,
} from "../controllers/availability";

const router = express.Router();

router.use(authMiddleware);

router.get("/:serviceId",          getSchedule);
router.put("/:serviceId/weekly",   updateWeeklySchedule);
router.post("/:serviceId/block",   addBlockedDate);
router.delete("/blocked/:id",      removeBlockedDate);

export default router;
