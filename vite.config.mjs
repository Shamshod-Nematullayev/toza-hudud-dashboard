// https://github.com/vitejs/vite/discussions/3448
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';
import { copyFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  plugins: [
    react(),
    jsconfigPaths(),
    {
      name: 'copy-headers',
      writeBundle() {
        copyFileSync('_headers', 'dist/_headers');
      }
    }
  ],
  base: '/',
  define: {
    global: 'window'
  },
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: path.resolve(__dirname, 'node_modules/$1')
      },
      {
        find: /^src\/(.*)$/,
        replacement: path.resolve(__dirname, 'src/$1')
      },
      {
        find: /^(assets|config|helpers|hooks|layout|locales|menu-items|routes|services|store|themes|types|ui-component|utils|views)\/(.*)$/,
        replacement: path.resolve(__dirname, 'src/$1/$2')
      },
      {
        find: /^(assets|config|helpers|hooks|layout|locales|menu-items|routes|services|store|themes|types|ui-component|utils|views|languageConfig|reportWebVitals)$/,
        replacement: path.resolve(__dirname, 'src/$1')
      }
    ]
  },
  server: {
    host: true,
    open: false,
    port: 3001,
    // Tashqaridan (ngrok, LAN) ochilganda backend so'rovlari shu yerdan localhost:5001 ga uzatiladi
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.io'],
    proxy: {
      '/api': { target: 'http://localhost:5001', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5001', changeOrigin: true, ws: true }
    }
  },
  preview: {
    open: true,
    port: 3001
  }
});
