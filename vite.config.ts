import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project under https://<user>.github.io/TriWizard/,
// so the production base must match the repo name. Dev server stays at root.
export default defineConfig({
  base: '/TriWizard/',
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  server: { port: 5173, host: true },
});
