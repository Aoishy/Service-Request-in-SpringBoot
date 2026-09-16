import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    proxy: {
      // Proxy REST API calls to the Spring Boot server
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      // Spring Boot WebSocket endpoint
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});