import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeProvider";
import { isNative } from "./native";
import "./theme/themes/index.css";
import "./styles.css";

// Le service worker sert l'installation et le hors-ligne de la PWA : inutile dans l'app native.
if (!isNative) registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
