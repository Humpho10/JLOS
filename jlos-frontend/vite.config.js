import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone frontend — independent of the Laravel backend in ../backend.
// `npm run dev` serves this on its own port with hot reload; `npm run build`
// produces a static `dist/` folder deployable anywhere.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    // Two real HTML entry points instead of one — admin.html is a genuine
    // separate file in the build output, so the server can find it
    // directly (like it already does for index.html) without needing any
    // rewrite/fallback rule configured. Nothing in the public site links to
    // it; it's reachable only by an admin typing the URL directly.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
