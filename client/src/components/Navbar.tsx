
import { FileText, Plus, Library, House } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-600 p-2 text-white">
            <FileText size={19} />
          </div>

          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Markdown Notes
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <NavLink to="/" end className={navLinkClass}>
            <House size={16} />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          <NavLink to="/library" className={navLinkClass}>
            <Library size={16} />
            <span className="hidden sm:inline">Library</span>
          </NavLink>
        </div>

        {/* New Note */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Note</span>
        </Link>
      </div>
    </nav>
  );
}
