import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/finca-reportes/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Reporte de Finca',
        short_name: 'Finca',
        description: 'Sistema de seguimiento de vaqueros',
        theme_color: '#1D9E75',
        background_color: '#f4f3ef',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
        {
          src: 'icon-192.svg',
          sizes: '192x192',
          type: 'image/svg+xml'
        },
        {
          src: 'icon-512.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        }
      ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/oyhotpwtqoeqmxoelxlm\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
})