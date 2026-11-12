import React, { useRef, useState } from "react";
import { FileText, Upload, Save, Eye, SpellCheck, Code2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Footer from "./Footer";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { axiosClient } from "../lib/axiosClinet";
import { useLocation, useNavigate } from "react-router-dom";

type Tab = "preview" | "grammar";

interface WorkspaceHeaderProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  editing: boolean;
}

function WorkspaceHeader({ onFileUpload, fileInputRef, editing }: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          <FileText size={16} />
          <span>Markdown Workspace</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {editing ? "Edit note" : "Create a note"}
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Write in Markdown, preview your content, and check its grammar.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept=".md,text/markdown,text/plain"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
      >
        <Upload size={16} />
        Upload Markdown
      </button>
    </header>
  );
}

interface NoteToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  onSave: () => void;
  saving: boolean;
  editing: boolean;
}

function NoteToolbar({ title, setTitle, content, onSave, saving, editing }: NoteToolbarProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <label
          htmlFor="note-title"
          className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          NOTE TITLE
        </label>

        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full border-0 bg-transparent p-0 text-lg font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
        />
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span>{wordCount} words</span>
          <span className="mx-2">·</span>
          <span>{charCount} characters</span>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : editing ? "Update Note" : "Save Note"}
        </button>
      </div>
    </div>
  );
}

interface EditorPanelProps {
  content: string;
  setContent: (content: string) => void;
  grammarResults: any[];
  appliedIndices: number[];
}

function EditorPanel({ content, setContent, grammarResults, appliedIndices }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const highlights = [];
  let cursor = 0;

  for (const [index, match] of grammarResults.entries()) {
    if (appliedIndices.includes(index)) continue;
    const start = Math.max(cursor, match.offset);
    const end = Math.min(content.length, match.offset + match.length);
    if (start >= end) continue;
    highlights.push(content.slice(cursor, start));
    highlights.push(<span key={index} className="underline decoration-wavy decoration-rose-500 underline-offset-4" title={match.message}>{content.slice(start, end)}</span>);
    cursor = end;
  }
  highlights.push(content.slice(cursor));

  return (
    <section className="flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Code2 size={16} className="text-slate-500 dark:text-slate-400" />
          Markdown Editor
        </div>

        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
          .md
        </span>
      </div>

      <div className="relative min-h-[400px] flex-1">
        <div ref={highlightsRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words bg-white p-5 font-mono text-sm leading-7 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
          {content ? highlights : <span className="text-slate-400 dark:text-slate-500"># Start writing...{"\n\n"}Write your note using Markdown.</span>}
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onScroll={(e) => {
            if (highlightsRef.current) {
              highlightsRef.current.scrollTop = e.currentTarget.scrollTop;
              highlightsRef.current.scrollLeft = e.currentTarget.scrollLeft;
            }
          }}
          spellCheck={false}
          aria-label="Markdown editor"
          className="absolute inset-0 h-full min-h-[400px] w-full resize-none overflow-auto bg-transparent p-5 font-mono text-sm leading-7 text-transparent caret-slate-900 outline-none selection:bg-indigo-300/50 dark:caret-white"
        />
      </div>

      <div className="flex h-10 shrink-0 items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 text-xs text-slate-500 dark:text-slate-400">
        <span>{content.length} characters</span>
        <span>Markdown supported</span>
      </div>
    </section>
  );
}

interface PreviewPanelProps {
  content: string;
  setContent: (content: string) => void;
  grammarResults: any[];
  setGrammarResults: React.Dispatch<React.SetStateAction<any[]>>;
  appliedIndices: number[];
  setAppliedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  onCheckGrammar: () => void;
  checkingGrammar: boolean;
}

function PreviewPanel({ content, setContent, grammarResults, setGrammarResults, appliedIndices, setAppliedIndices, onCheckGrammar, checkingGrammar }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<number, string>>({});
  const [appliedValues, setAppliedValues] = useState<Record<number, string>>({});

  const defaultMarkdown = `
# Welcome to Markdown Workspace

Upload a markdown file or start typing your notes here!

- Fast & Responsive
- Live Preview
- Dark Mode Support
`;

  const html = DOMPurify.sanitize(marked.parse(content.trim() ? content : defaultMarkdown, { async: false }));

  const handleApplySuggestion = (item: any, replacement: string, index: number) => {
    if (!item.suggestions?.length) return;
    const offset = item.offset;
    const length = appliedValues[index]?.length ?? item.length;

    const updatedContent =
      content.substring(0, offset) + replacement + content.substring(offset + length);

    setContent(updatedContent);
    setGrammarResults((matches) => matches.map((match, matchIndex) =>
      matchIndex !== index && match.offset >= offset + length
        ? { ...match, offset: match.offset + replacement.length - length }
        : match,
    ));
    setAppliedValues((prev) => ({ ...prev, [index]: replacement }));
    setAppliedIndices((prev) => prev.includes(index) ? prev : [...prev, index]);
  };

  return (
    <section className="flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
        <div className="flex h-full items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-medium transition ${
              activeTab === "preview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("grammar")}
            className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-medium transition ${
              activeTab === "grammar"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <SpellCheck size={16} />
            Grammar {grammarResults.length > 0 && `(${grammarResults.length - appliedIndices.length})`}
          </button>
        </div>

        {activeTab === "grammar" && (
          <button
            type="button"
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
          </button>
        )}
      </div>

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
                <SpellCheck className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white">
                Grammar checker
              </h3>

              <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Click below to check spelling and grammar suggestions using LanguageTool.
              </p>

              <button
                type="button"
                onClick={() => {
                  setAppliedIndices([]);
                  setAppliedValues({});
                  setSelectedSuggestions({});
                  onCheckGrammar();
                }}
                disabled={checkingGrammar}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
              >
                {checkingGrammar ? <Loader2 size={16} className="animate-spin" /> : <SpellCheck size={16} />}
                {checkingGrammar ? "Checking..." : "Check Grammar"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Suggestions ({grammarResults.length - appliedIndices.length} issues remaining)
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
                        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                      ) : (
                        <AlertCircle className="mt-0.5 shrink-0 text-amber-500" size={18} />
                      )}
                      <div className="space-y-1">
                        <p className={`text-sm font-medium ${isApplied ? "line-through opacity-75" : "text-slate-900 dark:text-white"}`}>
                          {item.message || "Grammar issue detected"}
                        </p>
                        {item.suggestions?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.suggestions.slice(0, 3).map((suggestion: string, rIdx: number) => (
                              <button
                                key={rIdx}
                                type="button"
                                aria-pressed={selected === suggestion}
                                onClick={() => setSelectedSuggestions((prev) => ({ ...prev, [index]: suggestion }))}
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                                  selected === suggestion
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                }`}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.suggestions?.length > 0 && (
                          <button
                            type="button"
                            disabled={!selected || selected === appliedValues[index]}
                            onClick={() => handleApplySuggestion(item, selected!, index)}
                            className="mt-2 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isApplied ? "Apply different suggestion" : "Apply suggestion"}
                          </button>
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
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingNote = (location.state as { note?: { id: number; title: string; content: string } } | null)?.note;
  const [title, setTitle] = useState(editingNote?.title ?? "");
  const [content, setContent] = useState(editingNote?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [grammarResults, setGrammarResults] = useState<any[]>([]);
  const [appliedIndices, setAppliedIndices] = useState<number[]>([]);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      setGrammarResults([]);
      setAppliedIndices([]);
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExt);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveNote = async () => {
    if (!content.trim()) {
      toast.error("Note content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const note = { title: title.trim() || "Untitled Note", content };
      if (editingNote) await axiosClient.patch(`/notes/${editingNote.id}`, note);
      else await axiosClient.post("/notes", note);
      toast.success(editingNote ? "Note updated." : "Note saved successfully.");
      navigate("/library");
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckGrammar = async () => {
    if (!content.trim()) {
      toast.error("Write or upload some text to check grammar.");
      return;
    }

    setCheckingGrammar(true);
    try {
      const response = await axiosClient.post("/notes/grammar", { text: content });
      setGrammarResults(response.data.data.matches || []);
      setAppliedIndices([]);
    } catch (error: any) {
      console.error("Grammar check failed:", error.response || error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to check grammar. Please try again.";
      toast.error(errorMsg);
    } finally {
      setCheckingGrammar(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <WorkspaceHeader
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
          editing={Boolean(editingNote)}
        />

        <NoteToolbar
          title={title}
          setTitle={setTitle}
          content={content}
          onSave={handleSaveNote}
          saving={saving}
          editing={Boolean(editingNote)}
        />

        <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
          <EditorPanel
            content={content}
            setContent={(value) => {
              setContent(value);
              setGrammarResults([]);
              setAppliedIndices([]);
            }}
            grammarResults={grammarResults}
            appliedIndices={appliedIndices}
          />
          <PreviewPanel
            content={content}
            setContent={setContent}
            grammarResults={grammarResults}
            setGrammarResults={setGrammarResults}
            appliedIndices={appliedIndices}
            setAppliedIndices={setAppliedIndices}
            onCheckGrammar={handleCheckGrammar}
            checkingGrammar={checkingGrammar}
          />
        </div>

        <Footer />
      </div>
    </main>
  );
}
