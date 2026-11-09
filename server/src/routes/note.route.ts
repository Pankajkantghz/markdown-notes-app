import { Router } from "express";

import {
  checkGrammar,
  createNote,
  getAllNotes,
} from "../controllers/note.controller.js";
import { db } from "../prisma/db.js";

const router = Router();

router.post("/grammar", checkGrammar);

router.post("/", createNote);

router.get("/", getAllNotes);

router.post("/:id/html", (req, res) => {
  // render  HTML logic
});

export default router;
