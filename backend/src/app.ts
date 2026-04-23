import express from "express";
import authRoutes from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.get("/api/me", authMiddleware, (req:any,res:any) => {
    res.json(req.user)
})

app.listen(5000, () => {
  console.log("Server jalan di port 5000");
});