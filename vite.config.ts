import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// User page (breslee1707.github.io) is served from the domain root.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    cssMinify: "lightningcss",
  },
});
