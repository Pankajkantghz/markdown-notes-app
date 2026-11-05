import axios from "axios";
import type {
  LanguageToolMatch,
  GrammarCheckResponse,
} from "../types/grammar.js";

interface LanguageToolApiResponse {
  matches: LanguageToolMatch[];
}

export const checkGrammarWithLanguageTool = async (
  text: string,
): Promise<GrammarCheckResponse> => {
  try {
    const params = new URLSearchParams({
      text,
      language: "en-US",
    });

    const response = await axios.post<LanguageToolApiResponse>(
      "http://localhost:8010/v2/check",
      params,
    );

    const matches = response.data.matches.map((match) => ({
      message: match.message,
      offset: match.offset,
      length: match.length,
      suggestions: match.replacements
        .slice(0, 3)
        .map((replacement) => replacement.value),
    }));

    return {
      success: true,
      originalText: text,
      correctedText: text,
      errorsCount: matches.length,
      matches,
    };
  } catch (error) {
    console.error("Grammar check failed:", error);
    throw new Error("Grammar check failed");
  }
};
