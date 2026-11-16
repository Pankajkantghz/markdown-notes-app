import { Router, type Router as ExpressRouter } from "express";
import {
  checkGrammar,
  createNote,
  deleteNote,
  getAllNotes,
  getNoteHtml,
  updateNote,
} from "../controllers/note.controller.js";

const router: ExpressRouter = Router();

router.post("/grammar", checkGrammar);
router.post("/", createNote);
router.get("/", getAllNotes);
router.patch("/:id", updateNote);
router.get("/:id/html", getNoteHtml);
router.delete("/:id", deleteNote);

export default router;
