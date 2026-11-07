const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Security 1: Restrict HTTP methods to GET and HEAD only
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Allow': 'GET, HEAD',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end('405 Method Not Allowed: Server ini hanya melayani permintaan GET & HEAD');
    return;
  }

  // Security 2: Handle malformed URI & null-byte injection safely
  let reqUrl = req.url.split('?')[0];
  if (reqUrl.indexOf('\0') !== -1 || reqUrl.indexOf('%00') !== -1) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end('400 Bad Request: Karakter null byte tidak diizinkan');
    return;
  }

  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(reqUrl);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end('400 Bad Request: Format URI tidak valid');
    return;
  }

  // Route shortcuts
  if (decodedUrl === '/') decodedUrl = '/index.html';
  if (decodedUrl === '/admin') decodedUrl = '/admin.html';
  if (decodedUrl === '/profil' || decodedUrl === '/tentang-kami') decodedUrl = '/profil.html';
  if (decodedUrl === '/layanan') decodedUrl = '/layanan.html';
  if (decodedUrl === '/kalkulator' || decodedUrl === '/kalkulator-btu') decodedUrl = '/kalkulator-btu.html';
  if (decodedUrl === '/diagnosa') decodedUrl = '/diagnosa.html';
  if (decodedUrl === '/kontak' || decodedUrl === '/booking') decodedUrl = '/kontak.html';
  if (decodedUrl === '/faq') decodedUrl = '/faq.html';

  let filePath = path.normalize(path.join(PUBLIC_DIR, decodedUrl));

  // If path doesn't have an extension and .html exists, serve it
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // Security check 3: Path Traversal Protection
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end('403 Forbidden: Akses di luar direktori publik tidak diizinkan');
    return;
  }

  // Security check 4: Block Hidden Files (dotfiles), Sensitive Configs & Source Code
  const baseName = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();
  const BLOCKED_FILES = ['server.js', 'package.json', 'package-lock.json', 'supabase-setup.sql', 'trading.txt'];
  const BLOCKED_EXTENSIONS = ['.sql', '.env', '.git', '.txt', '.bak', '.log', '.md', '.yml', '.yaml'];

  if (baseName.startsWith('.') || BLOCKED_FILES.includes(baseName) || BLOCKED_EXTENSIONS.includes(ext)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end('403 Forbidden: Akses ke berkas konfigurasi/sumber dibatasi');
    return;
  }

  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
      res.end('404 File Not Found');
      return;
    }

    // Security Headers + Cache-Control
    const securityHeaders = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // If HEAD request, return headers without body
    if (req.method === 'HEAD') {
      res.writeHead(200, securityHeaders);
      res.end();
      return;
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
        res.end(`500 Server Error: ${readErr.code}`);
        return;
      }

      res.writeHead(200, securityHeaders);
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SEJUKPRO Dev Server Aktif!`);
  console.log(`------------------------------------------------------`);
  console.log(`📱 Beranda Utama       : http://localhost:${PORT}/`);
  console.log(`🏢 Profil Perusahaan   : http://localhost:${PORT}/profil.html`);
  console.log(`🛠️ Layanan & Tarif     : http://localhost:${PORT}/layanan.html`);
  console.log(`🧮 Kalkulator BTU      : http://localhost:${PORT}/kalkulator-btu.html`);
  console.log(`🔍 Diagnosa Cepat      : http://localhost:${PORT}/diagnosa.html`);
  console.log(`📞 Pelayanan Pelanggan : http://localhost:${PORT}/kontak.html`);
  console.log(`❓ FAQ                 : http://localhost:${PORT}/faq.html`);
  console.log(`🔐 Panel Admin         : http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});
