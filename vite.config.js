// vite.config.js
// No top-level imports — the deployment platform pre-bundles this file with
// rolldown before npm install runs, so any top-level import of an npm package
// will fail to resolve. Everything is loaded dynamically inside the config.
export default async function () {
  const { defineConfig } = await import('vite')
  const plugins = []

  try {
    const { default: base44 } = await import('@base44/vite-plugin')
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
    const { default: react } = await import('@vitejs/plugin-react')
    plugins.push(react())
  } catch {
    // Not yet installed
  }

  return defineConfig({ plugins })
}
