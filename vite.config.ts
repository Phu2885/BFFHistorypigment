import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Имя репозитория — адрес приложения на GitHub Pages: https://phu2885.github.io/BFFHistorypigment/
const REPO_NAME = 'BFFHistorypigment'

// Сертификат для HTTPS создаётся командой npm run cert (пакет mkcert, см. scripts/make-cert.mjs).
// Приватные ключи в git не попадают (.gitignore).
const certDir = path.resolve(import.meta.dirname, 'certs')
const https = fs.existsSync(path.join(certDir, 'cert.key'))
  ? {
      key: fs.readFileSync(path.join(certDir, 'cert.key')),
      cert: fs.readFileSync(path.join(certDir, 'cert.crt')),
    }
  : undefined

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // npm run build:pages → mode "pages": сборка для GitHub Pages (только mock-данные)
  const base = mode === 'pages' ? `/${REPO_NAME}/` : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'Исторические пигменты',
          short_name: 'Пигменты',
          description: 'Каталог исторических пигментов для реконструкции первоначального цвета',
          lang: 'ru',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'portrait-primary',
          background_color: '#0b0c0f',
          theme_color: '#d4af37',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // приложение (js, css, html, иконки) кэшируется сразу — PWA открывается офлайн
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          // новая версия сразу заменяет старую, старые кэши удаляются
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/^\/api/, /^\/minio/],
          runtimeCaching: [
            {
              // изображения mock-данных кэшируются при первом просмотре
              urlPattern: ({ url }) => url.pathname.includes('/assets/images/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'pigment-images',
                expiration: { maxEntries: 60 },
              },
            },
            {
              // видео (6–15 МБ) не кэшируем: браузер загружает их потоком по частям (Range),
              // иначе service worker сначала скачивает файл целиком и видео не стартует
              urlPattern: ({ url }) => url.pathname.includes('/assets/videos/'),
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3000,
      host: true, // доступ с телефона по IP ноутбука в локальной сети
      strictPort: true,
      https,
      watch: {
        usePolling: true,
      },
      // Vite — обратный прокси: телефон обращается к ноутбуку, а запросы уходят на бэкенд ноутбука
      proxy: {
        // AJAX к веб-сервису Go — обход CORS через обратный прокси Vite
        '/api': {
          target: process.env.API_TARGET ?? 'http://localhost:8080',
          changeOrigin: true,
        },
        // Второй маршрут — изображения и видео напрямую из S3 (MinIO)
        '/minio': {
          target: 'http://localhost:9000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/minio/, ''),
        },
      },
    },
  }
})
