import { Router } from "express";
import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";

const api: Router = Router();
api.use("/auth", authRoutes);
api.use("/notes", noteRoutes);

export default api;
