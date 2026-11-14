export interface NoteResponse {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
export interface Note {
  id?: number | string;
  title: string;
  content: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface GrammarMatch {
  message?: string;
  offset: number;
  length: number;
  suggestions?: string[];
}
export interface NotesApiResponse {
  success: boolean;
  data: Note[];
  pagination: {
    currentPage: number;
    limit: number;
    totalNotes: number;
    totalPages: number;
  };
}
export interface NoteDetailData extends NoteResponse {
  htmlContent: string;
}
