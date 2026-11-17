import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
  }
}

export default function LoginRoute() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !buttonRef.current) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          setWorking(true);
          setError("");
          signIn(credential)
            .catch((error: unknown) =>
              setError(
                axios.isAxiosError(error)
                  ? error.response?.data?.error ||
                      "Cannot reach the API. Start the server and try again."
                  : "Google sign-in failed. Please try again.",
              ),
            )
            .finally(() => setWorking(false));
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: document.documentElement.classList.contains("dark")
          ? "filled_black"
          : "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 300,
      });
    };
    script.onerror = () => setError("Could not load Google sign-in.");
    document.head.appendChild(script);
    return () => script.remove();
  }, [signIn]);

  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/";
  if (user) return <Navigate to={destination} replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="rounded-xl bg-indigo-600 p-2.5 text-white">
            <BookOpen size={22} />
          </span>
          <span className="text-xl font-semibold tracking-tight">mireth</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Give your thoughts a place to grow.
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Write without distraction. Refine every thought. Keep what matters.
        </p>
        <div className="my-7 border-t border-slate-200 dark:border-slate-800" />
        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <div
            className={working ? "pointer-events-none opacity-60" : "min-h-10"}
            ref={buttonRef}
          />
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Set VITE_GOOGLE_CLIENT_ID in client/.env to enable sign-in.
          </p>
        )}
        {working && (
          <p className="mt-3 text-center text-sm text-slate-500">Signing in…</p>
        )}
        {error && (
          <p
            className="mt-3 text-center text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
