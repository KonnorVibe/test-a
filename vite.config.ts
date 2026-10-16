/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Relative base so the app works under any GitHub Pages sub-path.
  base: './',
  plugins: [
    react(),
    {
      // Dev server only: allow Vite's HMR socket. The build keeps connect-src 'none'.
      name: 'aya-dev-csp',
      apply: 'serve',
      transformIndexHtml: (html) => html.replace("connect-src 'none'", "connect-src 'self' ws://localhost:*"),
    },
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'aya',
        short_name: 'aya',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#faf6f4',
        theme_color: '#faf6f4',
        icons: [],
      },
      workbox: {
        // App shell only. No runtime caching: the app never talks to the network.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        runtimeCaching: [],
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
});
