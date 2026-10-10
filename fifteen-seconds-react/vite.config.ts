import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const here = path.dirname(fileURLToPath(import.meta.url));

// Isolated feature app: it reuses the repository's artwork in ../assets and
// never touches the root static site (index.html, style.css, script.js).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { "@": path.resolve(here, "src") },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app", "localhost"],
    fs: { allow: [path.resolve(here, "..")] },
  },
});
