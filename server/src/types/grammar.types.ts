export interface GrammarMatch {
  message: string;
  offset: number;
  length: number;
  suggestions: string[];
}

export interface LanguageToolMatch {
  message: string;
  offset: number;
  length: number;
  replacements: {
    value: string;
  }[];
}

export interface GrammarCheckResponse {
  success: boolean;
  originalText: string;
  correctedText: string;
  errorsCount: number;
  matches: GrammarMatch[];
}
