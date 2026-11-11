import { FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { NoteResponse } from "../features/notes/types";
import Footer from "./Footer";
import { axiosClient } from "../lib/axiosClinet";
export interface NotesApiResponse {
  success: boolean;
  data: NoteResponse[];
  pagination: {
    currentPage: number;
    limit: number;
    totalNotes: number;
    totalPages: number;
  };
}

export default function LibraryView() {
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch notes from backend on mount

  useEffect(() => {
    axiosClient
      .get<NotesApiResponse>("/notes") // Type yahan single object hoga, array nahi
      .then((response) => {
        // Backend ke response object se actual notes array extract kar rahe hain
        setNotes(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch notes:", error);
        setLoading(false);
      });
  }, []);

  //delete notes

  const handleDelete = async (id: number) => {
    try {
      await axiosClient.delete(`/notes/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase().trim();

    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <FileText size={16} />
              <span>Markdown Workspace</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Your Library
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and organize all your notes in one place.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus size={17} />
            New Note
          </button>
        </header>

        {/* Search and Note Count */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <span className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">
              {filteredNotes.length}
            </span>{" "}
            {filteredNotes.length === 1 ? "note" : "notes"}
          </span>
        </section>

        {/* Notes Grid */}
        {loading ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <article
                key={item}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                </div>

                <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                  <div className="h-3 w-full rounded bg-slate-200" />
                  <div className="h-3 w-5/6 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                </div>

                <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-6 w-14 rounded bg-slate-200" />
                </div>
              </article>
            ))}
          </section>
        ) : filteredNotes.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                      <FileText size={19} />
                    </div>

                    <h2 className="truncate text-base font-semibold text-slate-900">
                      {note.title}
                    </h2>
                  </div>

                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Markdown
                  </span>
                </div>

                {/* Content Preview */}
                <div className="min-h-28 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <pre className="line-clamp-5 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-600">
                    {note.content}
                  </pre>
                </div>

                {/* Card Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    Updated {note.updatedAt}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${note.title}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${note.title}`}
                      onClick={() => handleDelete(note.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          /* Empty State */
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <h2 className="text-sm font-semibold text-slate-900">
              {search.trim() ? "No matching notes" : "No notes yet"}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              {search.trim()
                ? "Try searching with a different title or keyword."
                : "Create your first note and it will be waiting here."}
            </p>

            {!search.trim() && (
              <button
                type="button"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create your first note
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
