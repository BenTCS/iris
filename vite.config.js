// vite.config.js
// The deployment platform pre-bundles this file with rolldown before
// npm install runs. Any import — static or dynamic — that rolldown can
// see will fail to resolve. We hide imports behind `new Function` so
// rolldown's static analysis can't detect them.
const dynImport = new Function('s', 'return import(s)')

export default async function ({ mode } = {}) {
  const { defineConfig, loadEnv } = await dynImport('vite')
  const plugins = []

  // Vite only exposes VITE_-prefixed vars and does not populate process.env
  // with the rest. Load every var (empty prefix) so the dev /api/chat
  // middleware below can read the server-only IRIS_AI_* secrets.
  const env = loadEnv(mode || 'development', process.cwd(), '')

  try {
    const { default: base44 } = await dynImport('@base44/vite-plugin')
    plugins.push(
      base44({
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true,
      }),
    )
  } catch {
    plugins.push({
      name: 'base44-alias-fallback',
      config() {
        return {
          resolve: { alias: { '@/': '/src/' } },
          optimizeDeps: {
            esbuildOptions: { loader: { '.js': 'jsx' } },
          },
        }
      },
    })
  }

  try {
    const { default: react } = await dynImport('@vitejs/plugin-react')
    plugins.push(react())
  } catch {
    // Not yet installed
  }

  // Vite's dev server does NOT execute serverless functions in /api, so the
  // browser's fetch("/api/chat") would otherwise hit the SPA fallback and
  // return HTML instead of JSON (the "something went wrong" error). This
  // middleware mirrors api/chat.js during local dev / preview so the chat
  // works everywhere. In production, Vercel runs api/chat.js directly.
  plugins.push({
    name: 'dev-api-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Allow', 'POST')
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `Method ${req.method} Not Allowed` }))
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const raw = Buffer.concat(chunks).toString('utf8') || '{}'
          const { message, history, user_id } = JSON.parse(raw)

          const aiUrl = env.IRIS_AI_URL || process.env.IRIS_AI_URL
          const apiKey = env.IRIS_AI_API_KEY || process.env.IRIS_AI_API_KEY

          res.setHeader('Content-Type', 'application/json')

          if (!aiUrl || !apiKey) {
            res.statusCode = 500
            res.end(
              JSON.stringify({
                error: 'Server environment variables are not configured.',
              }),
            )
            return
          }

          const apiRes = await fetch(aiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ message, history, user_id }),
          })

          const responseText = await apiRes.text()

          if (!apiRes.ok) {
            res.statusCode = 500
            res.end(
              JSON.stringify({
                error: `AI endpoint returned status ${apiRes.status}: ${responseText}`,
              }),
            )
            return
          }

          res.statusCode = 200
          res.end(responseText)
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    },
  })

  return defineConfig({ plugins })
}
