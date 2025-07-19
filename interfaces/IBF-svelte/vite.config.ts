import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    proxy: {
      // Proxy EspoCRM API calls to avoid CORS issues during development
      '/api/espocrm': {
        target: 'https://ibf-pivot-crm.510.global/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/espocrm/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying EspoCRM request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ EspoCRM proxy response:', proxyRes.statusCode);
          });
        }
      },
      // Proxy IBF API calls to avoid CORS issues during development
      '/api/ibf': {
        target: 'https://ibf-test.510.global/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ibf/, ''),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🌐 Proxying IBF API request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ IBF API proxy response:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})
