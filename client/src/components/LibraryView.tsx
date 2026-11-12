import {
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { NoteResponse } from "../features/notes/types";
import Footer from "./Footer";
import { axiosClient } from "../lib/axiosClinet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;
  const changePage = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
  };

  // Fetch notes from backend on mount or when currentPage changes
  useEffect(() => {
    axiosClient
      .get<NotesApiResponse>(`/notes?page=${currentPage}&limit=${limit}`)
      .then((response) => {
        setNotes(response.data.data);
        setTotalPages(response.data.pagination.totalPages || 1);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch notes:", error);
        setLoading(false);
      });
  }, [currentPage]);

  // Delete notes
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await axiosClient.delete(`/notes/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      toast.success("Note deleted.");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Could not delete note.");
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col justify-between">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-4 sm:p-6 lg:p-8 flex-1">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-slate-200 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              <FileText size={16} />
              <span>Markdown Workspace</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Your Library
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage and organize all your notes in one place.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            onClick={() => navigate("/")}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950"
            />
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-white">
              {filteredNotes.length}
            </span>{" "}
            {filteredNotes.length === 1 ? "note" : "notes"} on this page
          </span>
        </section>

        {/* Notes Grid with Smooth Fade-in Transition */}
        {loading ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-pulse">
            {[1, 2, 3].map((item) => (
              <article
                key={item}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="space-y-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 p-4">
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="mt-5 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </article>
            ))}
          </section>
        ) : filteredNotes.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 cursor-pointer animate-fadeIn transition-opacity duration-300">
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 p-2.5 text-indigo-600 dark:text-indigo-400">
                      <FileText size={19} />
                    </div>

                    <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                      {note.title}
                    </h2>
                  </div>

                  <span className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Markdown
                  </span>
                </div>

                {/* Content Preview */}
                <div className="min-h-28 flex-1 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                  <pre className="line-clamp-5 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-600 dark:text-slate-300">
                    {note.content}
                  </pre>
                </div>

                {/* Card Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Updated{" "}
                    {new Date(note.updatedAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${note.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/", { state: { note } });
                      }}
                      className="rounded-lg p-2 text-slate-400 dark:text-slate-500 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${note.title}`}
                      onClick={(e) => handleDelete(e, note.id)}
                      className="rounded-lg p-2 text-slate-400 dark:text-slate-500 transition hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400"
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
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 text-center opacity-0 animate-[fadeIn_0.8s_ease-in-out_forwards]">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {search.trim() ? "No matching notes" : "No notes yet"}
            </h2>

            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              {search.trim()
                ? "Try searching with a different title or keyword."
                : "Create your first note and it will be waiting here."}
            </p>

            {!search.trim() && (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Create your first note
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => changePage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {totalPages}
              </span>
            </span>

            <button
              onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
