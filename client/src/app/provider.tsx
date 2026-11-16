import React, { Component, type ErrorInfo } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppErrorBoundary>{children}</AppErrorBoundary>
    </>
  );
}

class AppErrorBoundary extends Component<
  React.PropsWithChildren,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled frontend error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reload the page to continue.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </main>
      );
    }
    return this.props.children;
  }
}
