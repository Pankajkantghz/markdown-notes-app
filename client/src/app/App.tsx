import { BrowserRouter, Routes, Route } from "react-router-dom";

import LibraryView from "../components/LibraryView";
import Home from "../components/Home";
import Navbar from "../components/Navbar";
import NoteReaderView from "../components/NoteReaderView";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<LibraryView />} />
        <Route path="/notes/:id" element={<NoteReaderView />} />
      </Routes>
    </BrowserRouter>
  );
}
