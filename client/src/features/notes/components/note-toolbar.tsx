import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";

interface NoteToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  onSave: () => void;
  saving: boolean;
  editing: boolean;
}

export function NoteToolbar({ title, setTitle, content, onSave, saving, editing }: NoteToolbarProps) {
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

        <Input
          id="note-title"
          type="text"
          maxLength={160}
          variant="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
        />
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <span>{wordCount} words</span>
          <span className="mx-2">·</span>
          <span>{charCount} characters</span>
        </div>

        <Button
          onClick={onSave}
          disabled={saving}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : editing ? "Update Note" : "Save Note"}
        </Button>
      </div>
    </div>
  );
}
