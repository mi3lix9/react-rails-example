import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import ViteRuby from "vite-plugin-ruby";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import inertia from "@inertiajs/vite";

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
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/frontend"),
    },
  },
});
