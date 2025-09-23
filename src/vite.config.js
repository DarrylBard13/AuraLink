import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  root: '.',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('react') && !id.includes('@stackframe')) {
            return 'react-vendor';
          }

          // Stack Auth - dynamic chunking based on actual usage
          if (id.includes('@stackframe/react')) {
            if (id.includes('SignIn') || id.includes('SignUp')) {
              return 'stack-auth-components';
            }
            if (id.includes('useUser')) {
              return 'stack-hooks';
            }
            if (id.includes('StackProvider') || id.includes('StackTheme') || id.includes('StackClientApp')) {
              return 'stack-providers';
            }
            if (id.includes('StackHandler')) {
              return 'stack-handlers';
            }
            // Fallback for other Stack Auth modules
            return 'stack-core';
          }

          // Radix UI components
          if (id.includes('@radix-ui/')) {
            return 'radix-vendor';
          }

          // Animation and styling
          if (id.includes('framer-motion') || id.includes('class-variance-authority') ||
              id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'animation-vendor';
          }

          // Charts
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }

          // Date utilities
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-vendor';
          }

          // Forms
          if (id.includes('react-hook-form') || id.includes('input-otp')) {
            return 'forms-vendor';
          }

          // Icons
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }

          // Database
          if (id.includes('@neondatabase/serverless') || id.includes('@vercel/postgres')) {
            return 'db-vendor';
          }

          // Utilities and routing
          if (id.includes('react-router-dom') || id.includes('sonner') || id.includes('cmdk') ||
              id.includes('vaul') || id.includes('react-markdown') ||
              id.includes('react-resizable-panels') || id.includes('embla-carousel-react')) {
            return 'utils-vendor';
          }

          // Large node_modules dependencies get their own chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
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