import React, { startTransition } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { normalizePublicPath } from './lib/prospectingPreviews'
import './index.css'
import './styles.css'

const rootEl = document.getElementById('root')!
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)

const ssrRoute = rootEl.getAttribute('data-ssr-route')
const currentPath = normalizePublicPath(window.location.pathname)
const isQuerySensitiveSsrRoute =
  (ssrRoute === '/cidades-atendidas' || ssrRoute === '/blog') &&
  window.location.search.length > 0

const shouldHydrate =
  rootEl.hasChildNodes() &&
  Boolean(ssrRoute) &&
  ssrRoute === currentPath &&
  !isQuerySensitiveSsrRoute

if (shouldHydrate) {
  startTransition(() => {
    hydrateRoot(rootEl, app)
  })
} else {
  createRoot(rootEl).render(app)
}
