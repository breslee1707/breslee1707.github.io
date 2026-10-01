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
    // three.js is one lazily loaded vendor chunk shared by the hero and the
    // Work stage; it never blocks first paint.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(three|@react-three)\//.test(id)) return "three";
        },
      },
    },
  },
});
