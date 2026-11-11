
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LibraryView from "../components/LibraryView";
import Home from "../components/Home";
import Navbar from "../components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<LibraryView />} />
      </Routes>
    </BrowserRouter>
  );
}
