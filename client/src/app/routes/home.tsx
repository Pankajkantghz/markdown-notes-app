import { useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createNote,
  updateNote,
  checkGrammarAPI,
  EditorPanel,
  NoteToolbar,
  PreviewPanel,
  WorkspaceHeader,
} from "@/features/notes";
import type { GrammarMatch } from "@/features/notes/types";

export default function HomeRoute() {
  const navigate = useNavigate();
  const note = (
    useLocation().state as {
      note?: { id: number; title: string; content: string };
    } | null
  )?.note;
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matches, setMatches] = useState<GrammarMatch[]>([]);
  const [applied, setApplied] = useState<number[]>([]);

  const resetGrammar = () => {
    setMatches([]);
    setApplied([]);
  };
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setContent(String(reader.result ?? ""));
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      resetGrammar();
    };
    reader.readAsText(file);
    event.target.value = "";
  };
  const save = async () => {
    if (!content.trim())
      return void toast.error("Note content cannot be empty.");
    setSaving(true);
    try {
      const data = { title: title.trim() || "Untitled Note", content };
      if (note) await updateNote(note.id, data);
      else await createNote(data);
      toast.success(note ? "Note updated." : "Note saved successfully.");
      navigate("/library");
    } catch {
      toast.error("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const checkGrammar = async () => {
    if (!content.trim())
      return void toast.error("Write or upload some text to check grammar.");
    setChecking(true);
    try {
      setMatches(await checkGrammarAPI(content));
      setApplied([]);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to check grammar. Please try again.",
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <WorkspaceHeader onFileUpload={handleFile} fileInputRef={fileRef} editing={Boolean(note)} />
      <NoteToolbar title={title} setTitle={setTitle} content={content} onSave={save} saving={saving} editing={Boolean(note)} />

      <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <EditorPanel
          content={content}
          setContent={(value) => {
            setContent(value);
            resetGrammar();
          }}
          grammarResults={matches}
          appliedIndices={applied}
        />
        <PreviewPanel
          content={content}
          setContent={setContent}
          grammarResults={matches}
          setGrammarResults={setMatches}
          appliedIndices={applied}
          setAppliedIndices={setApplied}
          onCheckGrammar={checkGrammar}
          checkingGrammar={checking}
        />
      </div>
    </main>
  );
}
