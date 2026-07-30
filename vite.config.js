import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  /* GitHub Pages serves a project site from https://<user>.github.io/<repo>/, so
     the built asset paths have to be prefixed or every request 404s and the page
     renders blank. The deploy workflow sets VITE_BASE from the repository name,
     so this needs no editing if the repo is renamed or forked. Local dev and any
     root-domain host keep '/'. */
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
