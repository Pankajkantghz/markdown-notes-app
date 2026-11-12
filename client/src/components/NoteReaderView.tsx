import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Pencil, Trash2 } from "lucide-react";
import { axiosClient } from "../lib/axiosClinet";
import Footer from "./Footer";
import { toast } from "sonner";

interface NoteDetailData {
  id: number;
  title: string;
  content: string;
  htmlContent: string;
  updatedAt: string;
}

const markdownStyles = `
  prose prose-red max-w-none 
  prose-headings:font-semibold prose-headings:tracking-tight 
  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg 
  prose-pre:bg-gray-900 prose-pre:text-red-500 prose-pre:rounded-xl 
  prose-code:text-blue-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded 
  prose-table:border-collapse 
  prose-th:border prose-th:border-slate-300 prose-th:p-2 
  prose-td:border prose-td:border-slate-300 prose-td:p-2
`.trim();

export default function NoteReaderView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<NoteDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    axiosClient
      .get(`/notes/${id}/html`)
      .then((response) => {
        setNote(response.data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch note HTML:", err);
        setError("Could not load the note. It may have been deleted.");
      });
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await axiosClient.delete(`/notes/${id}`);
      toast.success("Note deleted.");
      navigate("/library");
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Could not delete note.");
    }
  };

  if (error || !note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          {error || "Note not found."}
        </p>
        <button
          onClick={() => navigate("/library")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
        >
          Back to Library
        </button>
      </div>
    );
  }

  // Updated to include time as well
  const formattedDate = new Date(note.updatedAt).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8 flex-1">
        {/* Top Navigation & Actions */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => navigate("/library")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={18} />
            Back to Library
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/", { state: { note } })}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
            >
              <Pencil size={16} />
              Edit Note
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <Trash2 size={16} />
              Delete Note
            </button>
          </div>
        </div>

        {/* Note Article Header */}
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <FileText size={14} />
            <span>Markdown Note</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {note.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Calendar size={14} />
            <span>Updated {formattedDate}</span>
          </div>
        </header>

        {/* Rendered HTML Content Container with Dark Mode Invert */}
        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm transition-colors">
          <div
            className={`${markdownStyles} dark:prose-invert`}
            dangerouslySetInnerHTML={{ __html: note.htmlContent }}
          />
        </article>
      </div>

      <Footer />
    </main>
  );
}
