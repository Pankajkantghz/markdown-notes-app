import React from "react";
import { Toaster } from "sonner";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}