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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});