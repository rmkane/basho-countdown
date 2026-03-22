import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function spaFallbackMiddleware() {
  return (req, _res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    const raw = req.url?.split('?')[0] ?? ''
    if (
      raw.startsWith('/@') ||
      raw.startsWith('/src') ||
      raw.startsWith('/node_modules') ||
      /\.[a-zA-Z0-9]+$/.test(raw)
    ) {
      return next()
    }
    req.url = '/index.html'
    next()
  }
}

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        return () => {
          server.middlewares.use(spaFallbackMiddleware())
        }
      },
      configurePreviewServer(server) {
        return () => {
          server.middlewares.use(spaFallbackMiddleware())
        }
      },
    },
  ],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
