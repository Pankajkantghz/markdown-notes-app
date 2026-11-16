import type { InputHTMLAttributes, ReactNode } from "react";

type InputVariant = "default" | "title";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  leadingIcon?: ReactNode;
  wrapperClassName?: string;
}

const variants: Record<InputVariant, string> = {
  default: "w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-950",
  title: "w-full border-0 bg-transparent p-0 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-500",
};

export function Input({
  variant = "default",
  leadingIcon,
  wrapperClassName = "w-full",
  className = "",
  ...props
}: InputProps) {
  const input = (
    <input
      className={`${variants[variant]} ${variant === "default" ? (leadingIcon ? "pl-10" : "pl-4") : ""} ${className}`}
      {...props}
    />
  );

  return leadingIcon ? (
    <div className={`relative ${wrapperClassName}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        {leadingIcon}
      </span>
      {input}
    </div>
  ) : input;
}
