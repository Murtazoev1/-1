import React from "react";
import { createRoot } from "react-dom/client";
import SpyWordGame from "./App.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SpyWordGame />
  </React.StrictMode>
);
