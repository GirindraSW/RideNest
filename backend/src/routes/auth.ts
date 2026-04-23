import express from "express";
import {
  registerUser,
  registerProvider,
  login
} from "../controllers/auth";

const router = express.Router();

router.post("/register/user", registerUser);
router.post("/register/provider", registerProvider);
router.post("/login", login);

export default router;