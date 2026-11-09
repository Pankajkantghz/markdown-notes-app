import type { NextFunction, Request, Response } from "express";
import {
  checkGrammarWithLanguageTool,
  createNoteService,
  deleteNoteService,
  getAllNotesService,
  getNoteHtmlService,
  updateNoteService,
} from "../services/note.service.js";

const MAX_TITLE_LENGTH = 160;
const MAX_NOTE_LENGTH = 200_000;
const MAX_GRAMMAR_LENGTH = 50_000;
const MAX_PAGE_SIZE = 100;

const positiveInteger = (value: unknown): number | null => {
  if (typeof value !== "string") return null;
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
};

const parseNoteId = (value: string | string[] | undefined): number | null => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

export const checkGrammar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { text } = req.body ?? {};

    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({
        success: false,
        error: "Valid text string is required in request body",
      });
      return;
    }
    if (text.length > MAX_GRAMMAR_LENGTH) {
      res.status(413).json({
        success: false,
        error: `Text must be ${MAX_GRAMMAR_LENGTH.toLocaleString()} characters or fewer`,
      });
      return;
    }

    const grammarResults = await checkGrammarWithLanguageTool(text);

    res.status(200).json({
      success: true,
      data: grammarResults,
    });
  } catch {
    console.error("Grammar check failed");

    res.status(500).json({
      success: false,
      error: "Grammar check failed",
    });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }
    if (
      title.trim().length > MAX_TITLE_LENGTH ||
      (content !== undefined && typeof content !== "string")
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Title or content is invalid" });
    }
    if (typeof content === "string" && content.length > MAX_NOTE_LENGTH) {
      return res.status(413).json({
        success: false,
        error: `Note content must be ${MAX_NOTE_LENGTH.toLocaleString()} characters or fewer`,
      });
    }

    const newNote = await createNoteService({
      title: title.trim(),
      content: content ?? "",
    });

    return res.status(201).json({
      success: true,
      data: newNote,
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Could not create note",
    });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  const id = parseNoteId(req.params.id);
  if (id === null) {
    return res
      .status(400)
      .json({ success: false, error: "A valid note ID is required" });
  }

  try {
    const deletedNote = await deleteNoteService(id);
    if (!deletedNote) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    return res.status(200).json({ success: true, data: deletedNote });
  } catch {
    return res
      .status(500)
      .json({ success: false, error: "Could not delete note" });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  const id = parseNoteId(req.params.id);
  const { title, content } = req.body ?? {};
  if (id === null) {
    return res
      .status(400)
      .json({ success: false, error: "A valid note ID is required" });
  }
  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > MAX_TITLE_LENGTH ||
    typeof content !== "string"
  ) {
    return res.status(400).json({
      success: false,
      error: "A valid title and content are required",
    });
  }
  if (content.length > MAX_NOTE_LENGTH) {
    return res.status(413).json({
      success: false,
      error: `Note content must be ${MAX_NOTE_LENGTH.toLocaleString()} characters or fewer`,
    });
  }

  try {
    const updatedNote = await updateNoteService(id, title.trim(), content);
    if (!updatedNote)
      return res.status(404).json({ success: false, error: "Note not found" });
    return res.status(200).json({ success: true, data: updatedNote });
  } catch {
    return res
      .status(500)
      .json({ success: false, error: "Could not update note" });
  }
};

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const requestedPage =
      req.query.page === undefined ? 1 : positiveInteger(req.query.page);
    const requestedLimit =
      req.query.limit === undefined ? 12 : positiveInteger(req.query.limit);
    if (requestedPage === null || requestedLimit === null) {
      return res.status(400).json({
        success: false,
        error: "Page and limit must be positive integers",
      });
    }
    const page = requestedPage;
    const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
    if (page > Math.floor(Number.MAX_SAFE_INTEGER / limit)) {
      return res
        .status(400)
        .json({ success: false, error: "Page is too large" });
    }

    const result = await getAllNotesService(page, limit);

    return res.status(200).json({
      success: true,
      data: result.notes,
      pagination: result.pagination,
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Could not fetch notes",
    });
  }
};

export const getNoteHtml = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseNoteId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        success: false,
        error: "A valid note ID is required",
      });
    }

    const noteData = await getNoteHtmlService(id);

    if (!noteData) {
      return res.status(404).json({
        success: false,
        error: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      data: noteData,
    });
  } catch (error) {
    return next(error);
  }
};
