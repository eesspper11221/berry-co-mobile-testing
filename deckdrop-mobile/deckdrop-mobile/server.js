import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const app = express();
const port = process.env.PORT || 3000;
const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(rootDirectory, 'dist');

app.use(express.static(distDirectory));
app.get('*', (_request, response) => {
  response.sendFile(path.join(distDirectory, 'index.html'));
});

const startServer = (candidatePort) => {
  const server = app.listen(candidatePort, () => {
    console.log(`Server running at http://localhost:${candidatePort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      console.warn(`Port ${candidatePort} is in use; trying ${Number(candidatePort) + 1}.`);
      startServer(Number(candidatePort) + 1);
      return;
    }

    console.error(`Unable to start server on port ${candidatePort}:`, error.message);
    process.exitCode = 1;
  });
};

startServer(port);