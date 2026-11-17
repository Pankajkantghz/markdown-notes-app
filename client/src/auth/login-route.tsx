import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Feather, LockKeyhole, Sparkles } from "lucide-react";
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

let googleScriptPromise: Promise<void> | undefined;
let googleClientId: string | undefined;
let credentialHandler: ((credential: string) => void) | undefined;

function loadGoogleIdentity() {
  if (window.google) return Promise.resolve();
  googleScriptPromise ||= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleScriptPromise = undefined;
      reject(new Error("Could not load Google sign-in."));
    };
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export default function LoginRoute() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const dark =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const button = buttonRef.current;
    if (!clientId || !button) return;
    let active = true;
    credentialHandler = (credential) => {
      if (active) {
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
      }
    };
    loadGoogleIdentity()
      .then(() => {
        if (!active || !window.google) return;
        if (!googleClientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: ({ credential }) => credentialHandler?.(credential),
          });
          googleClientId = clientId;
        }
        if (googleClientId !== clientId) {
          setError(
            "The configured Google client changed. Reload the app to sign in.",
          );
          return;
        }
        window.google.accounts.id.renderButton(button, {
          theme: document.documentElement.classList.contains("dark")
            ? "filled_black"
            : "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: 300,
        });
      })
      .catch(() => {
        if (active) setError("Could not load Google sign-in.");
      });
    return () => {
      active = false;
      credentialHandler = undefined;
      button.replaceChildren();
    };
  }, [signIn]);

  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/";
  if (user) return <Navigate to={destination} replace />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-8">
      <div className="pointer-events-none absolute -left-36 -top-40 h-[30rem] w-[30rem] rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-950/35" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-950/25" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_-45px_rgba(25,30,48,0.28)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex min-h-[32rem] flex-col justify-between overflow-hidden bg-indigo-50 p-8 dark:bg-slate-950 sm:p-12">
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full border border-indigo-300/50 dark:border-indigo-400/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-56 w-56 rounded-full border border-indigo-300/50 dark:border-indigo-400/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <BookOpen size={21} strokeWidth={1.9} />
              </span>
              <span className="text-xl font-semibold tracking-[-0.04em]">
                mireth
              </span>
            </div>
            <div className="mt-16 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/65 px-3 py-1.5 text-xs font-medium text-indigo-800 dark:border-indigo-400/15 dark:bg-white/5 dark:text-indigo-200">
                <Sparkles size={13} /> A quieter space to think
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.12] tracking-[-0.05em] sm:text-5xl">
                Give your thoughts a place to grow.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-slate-600 dark:text-slate-300">
                Write without distraction. Refine every thought. Keep what
                matters.
              </p>
            </div>
          </div>
          <div className="relative mt-14 flex items-center gap-3 border-t border-indigo-200/80 pt-5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:border-indigo-300/10 dark:text-slate-400">
            <span>Write</span>
            <span className="h-px flex-1 bg-indigo-300/70 dark:bg-indigo-300/15" />
            <span>Refine</span>
            <span className="h-px flex-1 bg-indigo-300/70 dark:bg-indigo-300/15" />
            <span>Remember</span>
          </div>
        </section>

        <section className="flex min-h-[32rem] flex-col justify-center p-8 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-300">
              <Feather size={21} />
            </div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
              YOUR PERSONAL NOTEBOOK
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
              Welcome to Mireth
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Sign in to pick up where your ideas left off.
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/50">
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div
                  className={`flex min-h-11 justify-center transition-opacity ${working ? "pointer-events-none opacity-60" : ""}`}
                  ref={buttonRef}
                />
              ) : (
                <p className="px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  Set VITE_GOOGLE_CLIENT_ID in client/.env to enable sign-in.
                </p>
              )}
            </div>
            {working && (
              <p
                className="mt-3 text-center text-sm text-slate-500"
                role="status"
              >
                Signing you in…
              </p>
            )}
            {error && (
              <p
                className="mt-3 text-center text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span>MADE FOR YOUR IDEAS</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <Check
                  size={16}
                  className="text-indigo-600 dark:text-indigo-300"
                />{" "}
                Your notes stay organized in one place
              </li>
              <li className="flex items-center gap-3">
                <Check
                  size={16}
                  className="text-indigo-600 dark:text-indigo-300"
                />{" "}
                Your writing is private to your account
              </li>
            </ul>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={13} /> Secure sign-in with Google
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
