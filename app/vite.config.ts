import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Chemin de publication. Par défaut "/" ; pour servir l'app depuis
  // Home Assistant (dossier config/www/maison) : VITE_BASE=/local/maison/
  const base = env.VITE_BASE || "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icon.svg"],
        manifest: {
          name: "Maison",
          short_name: "Maison",
          description: "Pilotage des lampes et prises de la maison",
          lang: "fr",
          display: "standalone",
          start_url: base,
          scope: base,
          theme_color: "#391E34",
          background_color: "#391E34",
          icons: [
            { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
          ],
        },
        workbox: {
          // Ne jamais mettre en cache l'API ni l'authentification Home Assistant.
          navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
        },
      }),
    ],
  };
});
