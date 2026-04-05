import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import ViteRuby from "vite-plugin-ruby";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import inertia from "@inertiajs/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    ViteRuby(),
    inertia({
      ssr: {
        enabled: true,
        entrypoint: "app/frontend/entrypoints/ssr.tsx",
      },
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Store",
        short_name: "Store",
        description: "A fullstack Rails + React store application",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/frontend"),
    },
  },
});
