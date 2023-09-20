import React from "react";
import "./App.css";
import "tailwindcss/tailwind.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage, SignUpPage } from "./routes/Route.js";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/sign-up" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
