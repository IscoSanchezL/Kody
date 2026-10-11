import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Versión "de un solo archivo": dist-local/index.html se abre con doble clic
 * (file://), sin servidor. Para uso en aula o para compartir por Drive.
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist-local', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 10_000 },
});
