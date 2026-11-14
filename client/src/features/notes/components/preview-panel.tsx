import React, { useState } from "react";
import {
  Eye,
  SpellCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { GrammarMatch } from "../types";
import { Button } from "@/components/ui";
import { Panel, PanelHeader } from "@/components/ui";

type Tab = "preview" | "grammar";

interface PreviewPanelProps {
  content: string;
  setContent: (content: string) => void;
  grammarResults: GrammarMatch[];
  setGrammarResults: React.Dispatch<React.SetStateAction<GrammarMatch[]>>;
  appliedIndices: number[];
  setAppliedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  onCheckGrammar: () => void;
  checkingGrammar: boolean;
}

export function PreviewPanel({
  content,
  setContent,
  grammarResults,
  setGrammarResults,
  appliedIndices,
  setAppliedIndices,
  onCheckGrammar,
  checkingGrammar,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [selectedSuggestions, setSelectedSuggestions] = useState<
    Record<number, string>
  >({});
  const [appliedValues, setAppliedValues] = useState<Record<number, string>>(
    {},
  );

  const defaultMarkdown = `
# Welcome to Markdown Workspace

Upload a markdown file or start typing your notes here!

- Fast & Responsive
- Live Preview
- Dark Mode Support
`;

  const html = DOMPurify.sanitize(
    marked.parse(content.trim() ? content : defaultMarkdown, { async: false }),
  );

  const handleApplySuggestion = (
    item: GrammarMatch,
    replacement: string,
    index: number,
  ) => {
    if (!item.suggestions?.length) return;
    const offset = item.offset;
    const length = appliedValues[index]?.length ?? item.length;

    const updatedContent =
      content.substring(0, offset) +
      replacement +
      content.substring(offset + length);

    setContent(updatedContent);
    setGrammarResults((matches) =>
      matches.map((match, matchIndex) =>
        matchIndex !== index && match.offset >= offset + length
          ? { ...match, offset: match.offset + replacement.length - length }
          : match,
      ),
    );
    setAppliedValues((prev) => ({ ...prev, [index]: replacement }));
    setAppliedIndices((prev) =>
      prev.includes(index) ? prev : [...prev, index],
    );
  };

  return (
    <Panel>
      <PanelHeader>
        <div className="flex h-full items-center gap-4">
          <Button
            variant="unstyled"
            size="none"
            onClick={() => setActiveTab("preview")}
            className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-medium transition ${
              activeTab === "preview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Eye size={16} />
            Preview
          </Button>

          <Button
            variant="unstyled"
            size="none"
            onClick={() => setActiveTab("grammar")}
            className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-medium transition ${
              activeTab === "grammar"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <SpellCheck size={16} />
            Grammar{" "}
            {grammarResults.length > 0 &&
              `(${grammarResults.length - appliedIndices.length})`}
          </Button>
        </div>

        {activeTab === "grammar" && (
          <Button
            variant="unstyled"
            size="none"
            onClick={() => {
              setAppliedIndices([]);
              setAppliedValues({});
              setSelectedSuggestions({});
              onCheckGrammar();
            }}
            disabled={checkingGrammar}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {checkingGrammar ? "Checking..." : "Check grammar again"}
          </Button>
        )}
      </PanelHeader>

      {activeTab === "preview" ? (
        <div
          className="prose prose-slate dark:prose-invert max-w-none flex-1 overflow-y-auto p-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="flex flex-1 flex-col p-6 overflow-y-auto">
          {grammarResults.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 inline-flex rounded-full bg-indigo-50 dark:bg-indigo-950/50 p-4">
                <SpellCheck
                  className="text-indigo-600 dark:text-indigo-400"
                  size={24}
                />
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white">
                Grammar checker
              </h3>

              <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Click below to check spelling and grammar suggestions using
                LanguageTool.
              </p>

              <Button
                onClick={() => {
                  setAppliedIndices([]);
                  setAppliedValues({});
                  setSelectedSuggestions({});
                  onCheckGrammar();
                }}
                disabled={checkingGrammar}
                className="mt-5"
              >
                {checkingGrammar ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <SpellCheck size={16} />
                )}
                {checkingGrammar ? "Checking..." : "Check Grammar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Suggestions ({grammarResults.length - appliedIndices.length}{" "}
                  issues remaining)
                </span>
              </div>

              {grammarResults.map((item, index) => {
                const isApplied = appliedIndices.includes(index);
                const selected = selectedSuggestions[index];

                return (
                  <div
                    key={index}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-4 transition-all ${
                      isApplied
                        ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isApplied ? (
                        <CheckCircle2
                          className="mt-0.5 shrink-0 text-emerald-500"
                          size={18}
                        />
                      ) : (
                        <AlertCircle
                          className="mt-0.5 shrink-0 text-amber-500"
                          size={18}
                        />
                      )}
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-medium ${isApplied ? "line-through opacity-75" : "text-slate-900 dark:text-white"}`}
                        >
                          {item.message || "Grammar issue detected"}
                        </p>
                        {item.suggestions && item.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.suggestions
                              .slice(0, 3)
                              .map((suggestion: string, rIdx: number) => (
                                <Button
                                  variant="unstyled"
                                  size="none"
                                  key={rIdx}
                                  aria-pressed={selected === suggestion}
                                  onClick={() =>
                                    setSelectedSuggestions((prev) => ({
                                      ...prev,
                                      [index]: suggestion,
                                    }))
                                  }
                                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                    selected === suggestion
                                      ? "bg-indigo-600 text-white"
                                      : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                  }`}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                          </div>
                        )}
                        {item.suggestions && item.suggestions.length > 0 && (
                          <Button
                            size="sm"
                            disabled={
                              !selected || selected === appliedValues[index]
                            }
                            onClick={() =>
                              handleApplySuggestion(item, selected!, index)
                            }
                            className="mt-2"
                          >
                            {isApplied
                              ? "Apply different suggestion"
                              : "Apply suggestion"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {isApplied && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Applied ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
