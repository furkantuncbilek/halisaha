import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/halisaha/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SAHA — Halı Saha Kadro',
        short_name: 'SAHA',
        description: 'Halı saha kadro kur, diziliş yap, maç maç reyting gir.',
        theme_color: '#07140c',
        background_color: '#07140c',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/halisaha/',
        scope: '/halisaha/',
        lang: 'tr',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/halisaha/index.html',
      },
    }),
  ],
})
