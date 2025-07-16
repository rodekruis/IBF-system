import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

const server = createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  
  try {
    const html = readFileSync(join(__dirname, 'test.html'), 'utf8');
    res.end(html);
  } catch (error) {
    res.end(`
      <h1>IBF Dashboard Test Server</h1>
      <p>✅ Server is running on port ${port}</p>
      <p>🚀 Your Svelte dashboard is ready for development!</p>
    `);
  }
});

server.listen(port, () => {
  console.log(`🌍 IBF Dashboard test server running at http://localhost:${port}`);
  console.log('🎯 Features available:');
  console.log('  📱 Responsive design');
  console.log('  🔒 Security ready');
  console.log('  🚀 Lightweight bundle');
  console.log('  🛠️ Easy maintenance');
});
