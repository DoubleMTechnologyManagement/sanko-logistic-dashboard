const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve the Angular app from the dist directory
app.use(express.static(path.join(__dirname, '')));

// Proxy API requests to the PHP backend
app.use('/server', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/server': '', // remove /api prefix when forwarding to the target
  },
}));

// Catch-all route to serve the Angular app for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
