import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  // NOTE: the target must be the bare origin (no /api suffix) — Vite's proxy
  // preserves the incoming request path as-is, so a target that already
  // includes /api would double it to /api/api/....
  "/api": {
    target: process.env.VITE_FUNCTIONS_PROXY_TARGET || "http://localhost:9999",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  // `vite preview` serves the production build but still needs the same
  // proxy — used by tests/e2e (playwright.config.ts) against the real build.
  preview: { proxy: apiProxy },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
