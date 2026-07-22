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
  },
});
