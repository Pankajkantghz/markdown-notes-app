// src/app/router.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ContentLayout } from "@/components/layouts";
import HomeRoute from "./routes/home";
import LibraryRoute from "./routes/library";
import NoteRoute from "./routes/note";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ContentLayout>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/library" element={<LibraryRoute />} />
          <Route path="/notes/:id" element={<NoteRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </ContentLayout>
    </BrowserRouter>
  );
};

function NotFoundRoute() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        The page you requested doesn’t exist.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Go home
      </Link>
    </main>
  );
}
