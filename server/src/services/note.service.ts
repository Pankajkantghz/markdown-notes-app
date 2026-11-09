import axios from "axios";

import type {
  LanguageToolMatch,
  GrammarCheckResponse,
  GrammarMatch,
} from "../types/grammar.types.js";

import { db } from "../prisma/db.js";
import type { CreateNoteDTO, NoteResponse } from "../types/note.types.js";

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
    if (axios.isAxiosError(error)) {
      console.error("LanguageTool API error:", error.response?.data);
    } else {
      console.error("Unexpected grammar check error:", error);
    }

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

export const getAllNotesService = async (
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [notes, totalNotes] = await Promise.all([
    db.orm.public.Note
      .orderBy((note: any) => note.createdAt.desc())
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
