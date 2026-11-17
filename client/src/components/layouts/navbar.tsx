import { BookOpen, Library, House, Sun, Moon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { useAuth } from "@/auth/auth-context";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 sm:min-w-0 sm:justify-start sm:px-3 ${
      isActive
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/30"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/90 dark:backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm">
            <BookOpen size={19} />
          </div>

          <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            mireth
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end aria-label="Home" className={navLinkClass}>
            <House size={16} />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          <NavLink to="/library" aria-label="Library" className={navLinkClass}>
            <Library size={16} />
            <span className="hidden sm:inline">Library</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
              {user.name}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-11 shrink-0"
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </div>
    </nav>
  );
}
