import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import App from "./App";
import "@/styles/refinement.css";
import "@/styles/aerosense-color.css";
import "@/styles/site-polish.css";
import "@/styles/material.css";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
