import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Standalone frontend — independent of the Laravel backend in ../backend.
// `npm run dev` serves this on its own port with hot reload; `npm run build`
// produces a static `dist/` folder deployable anywhere.
//
// Tailwind is scoped to the /admin section (see src/admin/admin.css) — the
// public site already has its own hand-built design system in
// resources/css/, so Tailwind's utilities live only in the CSS file the
// admin bundle imports rather than being pulled into the public app.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
