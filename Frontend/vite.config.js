import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    base:'/vakrangee-onboarding-portal/',
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
        '/vakrangee-connect': {
          target: 'https://vkmssit.vakrangee.in',
          changeOrigin: true,
          secure: false,
        },
        '/nsdl-api': {
          target: 'https://vkms.vakrangee.in',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/nsdl-api/, '')
        }
      }
    },
    build: {
      sourcemap: false
    }
  }
})

