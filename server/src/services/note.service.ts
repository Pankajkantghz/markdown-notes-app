import axios from "axios";

import type {
  GrammarCheckResponse,
  GrammarMatch,
  SaplingEdit,
} from "../types/grammar.types.js";

import { db } from "../prisma/db.js";
import type {
  CreateNoteDTO,
  NoteResponse,
  RenderedNoteResponse,
} from "../types/note.types.js";
import { marked } from "marked";
import { safeMarkdownRenderer } from "../utils/markdown.js";
import config from "../config/index.js";

interface SaplingApiResponse {
  edits: SaplingEdit[];
}

export const checkGrammarWithSapling = async (
  text: string,
): Promise<GrammarCheckResponse> => {
  try {
    if (!config.saplingApiKey) throw new Error("Set SAPLING_API_KEY to enable grammar checks");
    const response = await axios.post<SaplingApiResponse>(
      "https://api.sapling.ai/api/v1/edits",
      { text, lang: "en", variety: "us-variety" },
      {
        headers: { Authorization: `Bearer ${config.saplingApiKey}` },
        timeout: 30_000,
        maxBodyLength: 1_000_000,
        maxContentLength: 1_000_000,
      },
    );

    const matches: GrammarMatch[] = response.data.edits.map((edit) => ({
      message: edit.general_error_type || edit.error_type || "Suggested correction",
      offset: edit.sentence_start + edit.start,
      length: edit.end - edit.start,
      suggestions: edit.replacement ? [edit.replacement] : [],
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
        ? "Sapling request failed"
        : "Unexpected grammar check failure",
    );

    throw new Error("Failed to check grammar");
  }
};

export const createNoteService = async (
  ownerId: number,
  data: CreateNoteDTO,
): Promise<NoteResponse> => {
  const { title, content } = data;
  const newNote = await db.orm.public.Note.create({
    title,
    content: content || "",
    ownerId,
  });

  return newNote as NoteResponse;
};

export const deleteNoteService = async (
  id: number,
  ownerId: number,
): Promise<NoteResponse | null> => {
  const deletedNote = await db.orm.public.Note.where({ id, ownerId }).delete();
  return deletedNote as NoteResponse | null;
};

export const updateNoteService = async (
  id: number,
  ownerId: number,
  title: string,
  content: string,
): Promise<NoteResponse | null> => {
  const updatedNote = await db.orm.public.Note.where({ id, ownerId }).update({
    title,
    content,
  });
  return updatedNote as NoteResponse | null;
};

export const getAllNotesService = async (
  ownerId: number,
  page: number = 1,
  limit: number = 12,
) => {
  const skip = (page - 1) * limit;

  const [notes, totalNotes] = await Promise.all([
    db.orm.public.Note.where({ ownerId })
      .orderBy((note: any) => note.createdAt.desc())
      .limit(limit)
      .offset(skip)
      .all(),
    db.orm.public.Note.where({ ownerId }).aggregate((aggregate: any) => ({
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
  ownerId: number,
): Promise<RenderedNoteResponse | null> => {
  const note = await db.orm.public.Note.first({ id, ownerId });
  if (!note) return null;

  const htmlContent = await marked.parse(note.content || "", {
    renderer: safeMarkdownRenderer(),
  });

  return { ...(note as NoteResponse), htmlContent };
};
