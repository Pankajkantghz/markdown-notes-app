import { Router, type Router as ExpressRouter } from "express";
import { getCurrentUser, googleLogin } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

const router: ExpressRouter = Router();

router.post("/google", googleLogin);
router.get("/me", requireAuth, getCurrentUser);

export default router;
