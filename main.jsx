import React from "react";
import { createRoot } from "react-dom/client";
import SpyWordGame from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SpyWordGame />
  </React.StrictMode>
);
