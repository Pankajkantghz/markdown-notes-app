import type { ComponentPropsWithoutRef } from "react";

export function Panel({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={`flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 ${className}`}
      {...props}
    />
  );
}

export function PanelHeader({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={`flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 dark:border-slate-800 dark:bg-slate-900/60 ${className}`}
      {...props}
    />
  );
}
