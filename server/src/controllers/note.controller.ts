import type { Request, Response } from "express";
import {
  checkGrammarWithLanguageTool,
  createNoteService,
  getAllNotesService,
} from "../services/note.service.js";

export const checkGrammar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({
        success: false,
        error: "Valid text string is required in request body",
      });
      return;
    }

    const grammarResults = await checkGrammarWithLanguageTool(text);

    res.status(200).json({
      success: true,
      data: grammarResults,
    });
  } catch (error) {
    console.error("Grammar check failed:", error);

    res.status(500).json({
      success: false,
      error: "Grammar check failed",
    });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    const newNote = await createNoteService({ title, content });

    return res.status(201).json({
      success: true,
      data: newNote,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
};

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllNotesService(page, limit);

    return res.status(200).json({
      success: true,
      data: result.notes,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Problem fetching data",
    });
  }
};
