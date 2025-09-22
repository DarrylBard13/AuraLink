import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          // UI components
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          // Animation and styling
          'animation-vendor': ['framer-motion', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          // Charts and data visualization
          'charts-vendor': ['recharts'],
          // Date utilities
          'date-vendor': ['date-fns', 'react-day-picker'],
          // Forms and input
          'forms-vendor': ['react-hook-form', 'input-otp'],
          // Icons and media
          'icons-vendor': ['lucide-react'],
          // Database and auth
          'stack-vendor': ['@stackframe/react'],
          'db-vendor': ['@neondatabase/serverless', '@vercel/postgres'],
          // Routing and utils
          'utils-vendor': ['react-router-dom', 'sonner', 'cmdk', 'vaul', 'react-markdown', 'react-resizable-panels', 'embla-carousel-react']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  }
})