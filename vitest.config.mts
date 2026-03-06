import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'utils': path.resolve(__dirname, './src/utils'),
      'pages': path.resolve(__dirname, './src/pages'),
      'hooks': path.resolve(__dirname, './src/hooks'),
      'store': path.resolve(__dirname, './src/store'),
      'types': path.resolve(__dirname, './src/types'),
      'services': path.resolve(__dirname, './src/services'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    pool: 'forks',
    coverage: {
      reporter: ['text', 'text-summary', 'html'],
    }
  },
});
