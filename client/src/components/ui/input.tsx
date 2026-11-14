import type { InputHTMLAttributes } from "react";

type InputVariant = "default" | "title";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
}

const variants: Record<InputVariant, string> = {
  default: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-950",
  title: "w-full border-0 bg-transparent p-0 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-500",
};

export function Input({
  variant = "default",
  className = "",
  ...props
}: InputProps) {
  return <input className={`${variants[variant]} ${className}`} {...props} />;
}
