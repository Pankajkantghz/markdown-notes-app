import { Router, type Router as ExpressRouter } from "express";
import {
  getCurrentUser,
  googleLogin,
  logout,
} from "../controllers/auth.controller.js";
import {
  requireAuth,
  requireTrustedRequest,
} from "../middleware/require-auth.js";

const router: ExpressRouter = Router();

router.use(requireTrustedRequest);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
