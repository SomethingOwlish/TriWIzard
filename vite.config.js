import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The design-system components carry a .jsx extension but the screens import
// them without it (e.g. `from '../components'`); allow esbuild to resolve .jsx.
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  server: { port: 5173, host: true },
});
