import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
  server: { port: 3000 },
  preview: { port: 4180 },

  // Keep JSX transform settings only (no loader mapping here)
  esbuild: {
    jsx: 'automatic',
    jsxDev: true
  },

  // The dependency scanner can treat ".js" as JSX if needed
  // (This does NOT affect your app source transforms — only deps)
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' }
    }
  }
})
