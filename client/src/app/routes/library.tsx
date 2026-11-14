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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { getNotes, deleteNoteAPI } from "@/features/notes";
import type { Note } from "@/features/notes";
export default function LibraryRoute() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
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
    getNotes(currentPage, limit)
      .then((data) => {
        setNotes(data.data);
        setTotalPages(data.pagination.totalPages || 1);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch notes:", error);
        toast.error("Could not load notes.");
        setLoading(false);
      });
  }, [currentPage]);

  // Delete notes
  const handleDelete = async (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    try {
      await deleteNoteAPI(id);
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
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-4 sm:p-6 lg:p-8 flex-1">
      <PageHeader
        title="Your Library"
        description="Manage and organize all your notes in one place."
        action={
          <Button
            onClick={() => navigate("/")}
          >
            <Plus size={17} /> New Note
          </Button>
        }
      />

      {/* Search and Note Count */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />

          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes..."
            aria-label="Search notes"
            className="pl-10"
          />
        </div>

        <span className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-white">
            {filteredNotes.length}
          </span>{" "}
          {filteredNotes.length === 1 ? "note" : "notes"} on this page
        </span>
      </section>

      {/* Notes Grid */}
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
              </div>

              <div className="mt-5 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-6 w-14 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </article>
          ))}
        </section>
      ) : filteredNotes.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-fadeIn transition-opacity duration-300">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-md cursor-pointer"
            >
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

              <div className="min-h-28 flex-1 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                <pre className="line-clamp-5 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {note.content}
                </pre>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Updated{" "}
                  {note.updatedAt
                    ? new Date(note.updatedAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${note.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/", { state: { note } });
                    }}
                  >
                    <Pencil size={16} />
                  </Button>

                  <Button
                    variant="danger"
                    size="icon"
                    aria-label={`Delete ${note.title}`}
                    onClick={(e) => handleDelete(e, note.id!)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 text-center">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {search.trim() ? "No matching notes" : "No notes yet"}
          </h2>

          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {search.trim()
              ? "Try searching with a different title or keyword."
              : "Create your first note and it will be waiting here."}
          </p>

          {!search.trim() && (
            <Button
              size="sm"
              onClick={() => navigate("/")}
              className="mt-5"
            >
              Create your first note
            </Button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => changePage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

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

          <Button
            variant="secondary"
            size="sm"
            onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
