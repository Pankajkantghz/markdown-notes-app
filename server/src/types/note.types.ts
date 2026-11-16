export interface CreateNoteDTO {
  title: string;
  content?: string;
}

export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenderedNoteResponse extends NoteResponse {
  htmlContent: string;
}
