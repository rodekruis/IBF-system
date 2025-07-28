import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    proxy: {
      '/api/ibf': {
        target: 'https://ibf-test.510.global',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ibf/, '/api'),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, 'to target:', proxyReq.getHeader('host'));
          });
        }
      }
    }
  }
})
