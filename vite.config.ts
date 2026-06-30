import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project under https://<user>.github.io/TriWIzard/,
// so the production base must match the repo name *exactly* — Pages paths are
// case-sensitive (repo is "TriWIzard", capital I). Dev server stays at root.
export default defineConfig({
  base: '/TriWIzard/',
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  server: { port: 5173, host: true },
});
