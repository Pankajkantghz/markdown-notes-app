import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger"
  | "unstyled";
export type ButtonSize = "md" | "sm" | "icon" | "none";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: "rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
  secondary: "rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost: "rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  subtle: "rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50",
  danger: "rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50",
  unstyled: "",
};

const sizes: Record<ButtonSize, string> = {
  md: "gap-2 px-4 py-2.5 text-sm",
  sm: "gap-1.5 px-3 py-2 text-sm",
  icon: "p-2",
  none: "",
};

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
