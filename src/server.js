const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const util = require('util');
const memoryCache = require('memory-cache');

require('dotenv').config();

let port = process.env.PORT || 8080;
let host = process.env.HOST || 'localhost';

const readFile = util.promisify(fs.readFile);
let isFileReading = false;

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
    pathname = path.join(__dirname, '..\\', sanitizePath);
  }

  let ext = path.parse(pathname).ext;
  if (ext === '') {
    pathname = path.join(pathname, '.\\index.html');
    ext = '.html';
  }

  let cachedData = memoryCache.get(pathname);

  if (cachedData) {
    console.log('Getting data from cache...');
    res.setHeader('Content-type', mimeType[ext] || 'text/plain');
    res.end(cachedData);
  } else if (!isFileReading && !cachedData) {
    console.log('Getting data from disk...');
    isFileReading = true;
    readFile(pathname)
      .then((data) => {
        isFileReading = false;
        memoryCache.put(pathname, data, 10000);
        console.log('Has got data from the disk');
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
      })
      .catch((error) => {
        isFileReading = false;
        res.statusCode = 500;
        res.end(`Error getting the file: ${error}.`);
      });
  } else {
    res.statusCode = 500;
    res.end(`Error. File is already reading.`);
  }
});

server.listen(port, host, () => {
  console.log(`Server is listening ${host}:${port}`);
});
