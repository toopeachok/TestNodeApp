const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const port = process.env.PORT;
const host = process.env.HOST;

const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  const sanitizePath = path
    .normalize(parsedUrl.pathname)
    .replace(/^(\.\.[\/\\])+/, '');

  let pathname = '';

  if (sanitizePath === '\\') {
    pathname = __dirname;
  } else {
    pathname = path.join(__dirname, '../', sanitizePath);
  }

  if (fs.existsSync(pathname)) {
    if (fs.statSync(pathname).isDirectory()) pathname += '/index.html';

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
      }
    });
  } else {
    res.statusCode = 404;
    res.end(`File ${pathname} not found!`);
  }
});

server.listen(port, host, () => {
  console.log(`Server is listening ${host}:${port}`);
});
