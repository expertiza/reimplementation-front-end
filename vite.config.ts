// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'utils': path.resolve(__dirname, './src/utils'),
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