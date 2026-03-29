// vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
// Project uses Vite 7; Vitest 1.x depends on an older nested Vite — plugin types conflict in TS only.
export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridge Vite 7 plugin types vs Vitest's bundled Vite
  plugins: [react() as any],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'utils': path.resolve(__dirname, './src/utils'),
      'store': path.resolve(__dirname, "./src/store"),
      'hooks': path.resolve(__dirname, "./src/hooks"),
      'pages': path.resolve(__dirname, "./src/pages"),
      'assets': path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    port: 3000,            // frontend runs here
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:3002",   // backend Rails server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
