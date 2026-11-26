// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const DEFAULT_POLLING_INTERVAL = 500;

// https://vitejs.dev/config/
export default defineConfig(() => {
  const forcePolling = process.env.VITE_FORCE_POLLING === "true";
  const configuredPollingInterval = Number.parseInt(process.env.CHOKIDAR_INTERVAL ?? "", 10);
  const pollingInterval = Number.isNaN(configuredPollingInterval)
    ? DEFAULT_POLLING_INTERVAL
    : configuredPollingInterval;
  const backendProxyTarget = process.env.VITE_DEV_PROXY_TARGET ?? "http://localhost:3002";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        components: path.resolve(__dirname, "./src/components"),
        utils: path.resolve(__dirname, "./src/utils"),
        store: path.resolve(__dirname, "./src/store"),
        hooks: path.resolve(__dirname, "./src/hooks"),
        pages: path.resolve(__dirname, "./src/pages"),
        assets: path.resolve(__dirname, "./src/assets"),
      },
    },
    server: {
      port: 3000, // frontend runs here
      host: "0.0.0.0",
      watch: forcePolling
        ? {
            usePolling: true,
            interval: pollingInterval,
          }
        : undefined,
      proxy: {
        "/api": {
          target: backendProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
