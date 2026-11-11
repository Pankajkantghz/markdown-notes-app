import { useState } from "react";
import { FileText, Upload, Save, Eye, SpellCheck, Code2 } from "lucide-react";
import Footer from "./Footer";
import { marked } from "marked";

type Tab = "preview" | "grammar";

function WorkspaceHeader() {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
          <FileText size={16} />
          <span>Markdown Workspace</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Create a note
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Write in Markdown, preview your content, and check its grammar.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Upload size={16} />
        Upload Markdown
      </button>
    </header>
  );
}

function NoteToolbar() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <label
          htmlFor="note-title"
          className="mb-1 block text-xs font-medium text-slate-500"
        >
          NOTE TITLE
        </label>

        <input
          id="note-title"
          type="text"
          placeholder="Untitled note"
          className="w-full border-0 bg-transparent p-0 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
        />
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-xs text-slate-500">
          <span>0 words</span>
          <span className="mx-2">·</span>
          <span>0 characters</span>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Save size={16} />
          Save Note
        </button>
      </div>
    </div>
  );
}

function EditorPanel() {
  return (
    <section className="flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Code2 size={16} className="text-slate-500" />
          Markdown Editor
        </div>

        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
          .md
        </span>
      </div>

      <textarea
        placeholder={"# Start writing...\n\nWrite your note using Markdown."}
        spellCheck={false}
        aria-label="Markdown editor"
        className="min-h-[400px] w-full flex-1 resize-none bg-white p-5 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-100"
      />

      <div className="flex h-10 shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-4 text-xs text-slate-500">
        <span>0 characters</span>
        <span>Markdown supported</span>
      </div>
    </section>
  );
}

function PreviewPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  const dummyMarkdown = `
# My First Note

This is a **Markdown** note.

- React
- Node.js
- PostgreSQL

## Learning Goals

1. Build a React application.
2. Create a Node.js backend.
3. Connect PostgreSQL.
`;

  const html = marked.parse(dummyMarkdown);

  return (
    <section className="flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex h-full items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-medium transition ${
              activeTab === "preview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
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
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <SpellCheck size={16} />
            Grammar
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div
          className="prose prose-slate max-w-none flex-1 overflow-y-auto p-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4 inline-flex rounded-full bg-indigo-50 p-4">
              <SpellCheck size={24} className="text-indigo-600" />
            </div>

            <h3 className="font-semibold text-slate-900">Grammar checker</h3>

            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Grammar suggestions and spelling corrections will appear here.
            </p>

            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <SpellCheck size={16} />
              Check Grammar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <WorkspaceHeader />

        <NoteToolbar />

        <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
          <EditorPanel />
          <PreviewPanel />
        </div>

        <Footer />
      </div>
    </main>
  );
}
