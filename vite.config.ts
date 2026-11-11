import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  base: '/',
  plugins: [react()],
  ssr: {
    noExternal: ['react-helmet-async'],
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  build: {
    rollupOptions: isSsrBuild
      ? undefined
      : {
          output: {
            manualChunks(id) {
              if (!id.includes('node_modules')) return

              if (id.includes('@supabase')) return 'vendor-supabase'
              if (id.includes('@tanstack')) return 'vendor-query'
              if (id.includes('@dnd-kit')) return 'vendor-dnd'
              if (id.includes('react-imask') || id.includes('imask')) return 'vendor-imask'
              if (id.includes('lucide-react')) return 'vendor-icons'
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react'

              return 'vendor'
            },
          },
        },
  },
}))
