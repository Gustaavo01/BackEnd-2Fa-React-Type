import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { FlashMessageProvider } from "/trabalho rogerio/frontend/rogerio trab/FlashMessageContext/FlashMessageContext";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <FlashMessageProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </FlashMessageProvider>
);
