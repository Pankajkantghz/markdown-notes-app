export interface GrammarMatch {
  message: string;
  offset: number;
  length: number;
  suggestions: string[];
}

export interface SaplingEdit {
  start: number;
  end: number;
  sentence_start: number;
  replacement: string;
  error_type?: string;
  general_error_type?: string;
}

export interface GrammarCheckResponse {
  success: boolean;
  originalText: string;
  correctedText: string;
  errorsCount: number;
  matches: GrammarMatch[];
}
