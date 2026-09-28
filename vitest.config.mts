import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
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
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    pool: 'forks',
    coverage: {
      reporter: ['text', 'text-summary', 'html'],
    }
  },
});
