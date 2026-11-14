import { axiosClient } from "@/lib/api-client";
import type { Note, NoteDetailData, NotesApiResponse } from "../types";

export const getNotes = async (page: number = 1, limit: number = 9) => {
  const response = await axiosClient.get<NotesApiResponse>(
    `/notes?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getNoteHtml = async (id: number | string) => {
  const response = await axiosClient.get<{
    success: boolean;
    data: NoteDetailData;
  }>(`/notes/${id}/html`);
  return response.data.data;
};

export const deleteNoteAPI = async (id: number | string) => {
  const response = await axiosClient.delete(`/notes/${id}`);
  return response.data;
};

export const createNote = async (data: Note) => {
  const response = await axiosClient.post("/notes", data);
  return response.data;
};

export const updateNote = async (id: number | string, data: Note) => {
  const response = await axiosClient.patch(`/notes/${id}`, data);
  return response.data;
};

export const checkGrammarAPI = async (text: string) => {
  const response = await axiosClient.post("/notes/grammar", { text });
  return response.data.data.matches || [];
};
