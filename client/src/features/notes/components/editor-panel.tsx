import { Code2 } from "lucide-react";
import { useRef } from "react";
import type { GrammarMatch } from "../types";
import { Panel, PanelHeader } from "@/components/ui";

interface EditorPanelProps {
  content: string;
  setContent: (content: string) => void;
  grammarResults: GrammarMatch[];
  appliedIndices: number[];
}

export function EditorPanel({ content, setContent, grammarResults, appliedIndices }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const highlights = [];
  let cursor = 0;

  const orderedMatches = grammarResults
    .map((match, index) => ({ match, index }))
    .sort((a, b) => a.match.offset - b.match.offset);

  for (const { match, index } of orderedMatches) {
    if (appliedIndices.includes(index)) continue;
    const start = Math.max(cursor, 0, match.offset);
    const end = Math.min(content.length, match.offset + match.length);
    if (start >= end) continue;
    highlights.push(content.slice(cursor, start));
    highlights.push(<span key={index} className="underline decoration-wavy decoration-rose-500 underline-offset-4" title={match.message}>{content.slice(start, end)}</span>);
    cursor = end;
  }
  highlights.push(content.slice(cursor));

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Code2 size={16} className="text-slate-500 dark:text-slate-400" />
          Markdown Editor
        </div>

        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
          .md
        </span>
      </PanelHeader>

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
    </Panel>
  );
}
