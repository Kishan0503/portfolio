import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev-only middleware that runs the Vercel serverless functions in `api/`
 * during `npm run dev`. Without this, the Vite dev server returns 404 for
 * `/api/*` (those functions only exist on Vercel in production). It shims the
 * Express-like `res` helpers (status/json/send) that Vercel provides so the
 * same handlers work unchanged locally.
 */
function apiDevServer() {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()
        const route = req.url.split('?')[0].replace(/^\/api\//, '').replace(/\/+$/, '')

        let mod
        try {
          mod = await server.ssrLoadModule(`/api/${route}.js`)
        } catch {
          return next() // no matching function file — let Vite handle it
        }
        const handler = mod?.default
        if (typeof handler !== 'function') return next()

        // Collect the request body and expose it as req.body (parsed JSON).
        let raw = ''
        await new Promise((resolve) => {
          req.on('data', (c) => (raw += c))
          req.on('end', resolve)
          req.on('error', resolve)
        })
        try {
          req.body = raw ? JSON.parse(raw) : {}
        } catch {
          req.body = {}
        }

        // Shim Vercel's response helpers onto the Node response.
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (obj) => {
          if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
          return res
        }
        res.send = (data) => {
          res.end(data)
          return res
        }

        try {
          await handler(req, res)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `Dev API error: ${err?.message || err}` }))
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env into process.env so the dev API handlers can read GITHUB_TOKEN /
  // RESEND_API_KEY (Vite otherwise only exposes VITE_-prefixed vars).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), apiDevServer()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            particles: ['@tsparticles/react', '@tsparticles/slim'],
            gsap: ['gsap'],
          },
        },
      },
    },
  }
})
