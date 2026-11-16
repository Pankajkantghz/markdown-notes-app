import { Router } from "express";
import noteRoutes from "./routes/note.routes.js";

const api: Router = Router();
api.use("/notes", noteRoutes);

export default api;
