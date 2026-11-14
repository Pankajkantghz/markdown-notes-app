import { Upload } from "lucide-react";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import type { ChangeEvent, RefObject } from "react";

interface WorkspaceHeaderProps {
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  editing: boolean;
}

export function WorkspaceHeader({ onFileUpload, fileInputRef, editing }: WorkspaceHeaderProps) {
  return (
    <PageHeader
      title={editing ? "Edit note" : "Create a note"}
      description="Write in Markdown, preview your content, and check its grammar."
      action={
        <>
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileUpload}
            accept=".md,text/markdown,text/plain"
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} /> Upload Markdown
          </Button>
        </>
      }
    />
  );
}
