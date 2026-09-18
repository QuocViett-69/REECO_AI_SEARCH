import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@reeco/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /packages[\\/]shared[\\/]dist/],
    },
  },
});
