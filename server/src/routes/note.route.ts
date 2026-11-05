import { Router } from "express";
import { checkGrammarWithLanguageTool } from "../services/note.service.js";

const router = Router();

router.post("/grammar", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text != "string") {
      res
        .status(400)
        .json({ error: "Valid text string is required in request body" });
      return;
    }

    const grammarResults = await checkGrammarWithLanguageTool(text);

    res.status(200).json({
      success: true,
      data: grammarResults,
    });
  } catch (error) {
    console.error("Grammar check failed:", error);

    return res.status(500).json({
      success: false,
      error: "Grammar check failed",
    });
  }
});

router.post("/", (req, res) => {
  // save markdown note logic
});
router.get("/", (req, res) => {
  // get note logic
});
router.post("/:id/html", (req, res) => {
  // render  HTML logic
});

export default router;
