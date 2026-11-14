// src/app/router.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        </Routes>
      </ContentLayout>
    </BrowserRouter>
  );
};