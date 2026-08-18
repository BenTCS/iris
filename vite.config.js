// vite.config.js
// The deployment platform pre-bundles this file with rolldown before
// npm install runs. Any import — static or dynamic — that rolldown can
// see will fail to resolve. We hide imports behind `new Function` so
// rolldown's static analysis can't detect them.
const dynImport = new Function('s', 'return import(s)')

export default async function () {
  const { defineConfig } = await dynImport('vite')
  const plugins = []

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

  return defineConfig({ plugins })
}
