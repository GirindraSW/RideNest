import express from "express";
import { authMiddleware } from "../middleware/auth";
import { createService, getMyServices, updateService, deleteService } from "../controllers/service";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createService);
router.get("/my", getMyServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
