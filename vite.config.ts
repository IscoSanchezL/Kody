/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Solo se usa BASE_PATH; evitamos instalar todos los tipos de Node.
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  // En GitHub Pages la app vive en una subcarpeta (/Kody/); el flujo la define con BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 2500 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
