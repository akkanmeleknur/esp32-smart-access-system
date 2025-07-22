// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Kartlar from "./pages/Kartlar";
import Hareketler from "./pages/Hareketler";
import SistemOdasi from "./pages/SistemOdasi";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hareketler />} />
        <Route path="/kartlar" element={<Kartlar />} />
        <Route path="/sistemodasi" element={<SistemOdasi />} />
      </Routes>
    </Router>
  );
}

export default App;
