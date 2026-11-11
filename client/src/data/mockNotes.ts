import type { NoteResponse } from "../features/notes/types";


export const dummyNotes: NoteResponse[] = [
  {
    id: 1,
    title: "Project Launch Plan",
    content: "# Product Launch Plan\n\n- [ ] Market Research\n- [ ] Feature Finalization",
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-10T12:00:00Z",
  },
  {
    id: 2,
    title: "Markdown Syntax Guide",
    content: "# Subheading\n\nFormatting examples using code blocks.",
    createdAt: "2026-07-05T08:30:00Z",
    updatedAt: "2026-07-09T14:30:00Z",
  },
];