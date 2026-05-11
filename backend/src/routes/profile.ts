import express from "express";
import { authMiddleware } from "../middleware/auth";
import { getProfile, updateProfile, updateProviderProfile } from "../controllers/profile";

const router = express.Router();

router.use(authMiddleware);

router.get("/",          getProfile);
router.put("/",          updateProfile);
router.put("/provider",  updateProviderProfile);

export default router;
