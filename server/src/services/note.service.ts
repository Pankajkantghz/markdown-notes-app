import axios from "axios";

import type {
  LanguageToolMatch,
  GrammarCheckResponse,
  GrammarMatch,
} from "../types/grammar.types.js";

import { db } from "../prisma/db.js";
import type {
  CreateNoteDTO,
  NoteResponse,
  RenderedNoteResponse,
} from "../types/note.types.js";
import { marked } from "marked";
import { safeMarkdownRenderer } from "../utils/markdown.js";

interface LanguageToolApiResponse {
  matches: LanguageToolMatch[];
}

export const checkGrammarWithLanguageTool = async (
  text: string,
): Promise<GrammarCheckResponse> => {
  try {
    const url = "http://localhost:8010/v2/check";

    const formbody = new URLSearchParams();
    formbody.append("language", "en-US");
    formbody.append("text", text);

    const response = await axios.post<LanguageToolApiResponse>(url, formbody, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15_000,
      maxBodyLength: 1_000_000,
      maxContentLength: 1_000_000,
    });

    const matches: GrammarMatch[] = response.data.matches.map((match) => ({
      message: match.message,
      offset: match.offset,
      length: match.length,
      suggestions: (match.replacements || []).slice(0, 3).map((e) => e.value),
    }));

    return {
      success: true,
      originalText: text,
      correctedText: text,
      matches,
      errorsCount: matches.length,
    };
  } catch (error) {
    console.error(
      axios.isAxiosError(error)
        ? "LanguageTool request failed"
        : "Unexpected grammar check failure",
    );

    throw new Error("Failed to check grammar");
  }
};

export const createNoteService = async (
  data: CreateNoteDTO,
): Promise<NoteResponse> => {
  const { title, content } = data;
  const newNote = await db.orm.public.Note.create({
    title,
    content: content || "",
  });

  return newNote as NoteResponse;
};

export const deleteNoteService = async (
  id: number,
): Promise<NoteResponse | null> => {
  const deletedNote = await db.orm.public.Note.where({ id }).delete();
  return deletedNote as NoteResponse | null;
};

export const updateNoteService = async (
  id: number,
  title: string,
  content: string,
): Promise<NoteResponse | null> => {
  const updatedNote = await db.orm.public.Note.where({ id }).update({
    title,
    content,
  });
  return updatedNote as NoteResponse | null;
};

export const getAllNotesService = async (
  page: number = 1,
  limit: number = 12,
) => {
  const skip = (page - 1) * limit;

  const [notes, totalNotes] = await Promise.all([
    db.orm.public.Note.orderBy((note: any) => note.createdAt.desc())
      .limit(limit)
      .offset(skip)
      .all(),
    db.orm.public.Note.aggregate((aggregate: any) => ({
      total: aggregate.count(),
    })),
  ]);

  return {
    notes,
    pagination: {
      currentPage: page,
      limit,
      totalNotes: totalNotes.total,
      totalPages: Math.ceil(totalNotes.total / limit),
    },
  };
};

export const getNoteHtmlService = async (
  id: number,
): Promise<RenderedNoteResponse | null> => {
  const note = await db.orm.public.Note.first({ id });
  if (!note) return null;

  const htmlContent = await marked.parse(note.content || "", {
    renderer: safeMarkdownRenderer(),
  });

  return { ...(note as NoteResponse), htmlContent };
};
