import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',  // <-- Aquí agregas esto para que las rutas en el build sean relativas
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // URL de tu servidor backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

