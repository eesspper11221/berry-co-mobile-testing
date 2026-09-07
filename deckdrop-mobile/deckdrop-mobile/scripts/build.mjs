import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import esbuild from 'esbuild';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectDirectory, 'dist');
const assetsDirectory = path.join(distDirectory, 'assets');
const tailwindCommand = process.platform === 'win32'
  ? path.join(projectDirectory, 'node_modules', '.bin', 'tailwindcss.cmd')
  : path.join(projectDirectory, 'node_modules', '.bin', 'tailwindcss');

fs.rmSync(distDirectory, {recursive: true, force: true});
fs.mkdirSync(assetsDirectory, {recursive: true});

await esbuild.build({
  bundle: true,
  entryPoints: [path.join(projectDirectory, 'src', 'main.tsx')],
  format: 'esm',
  outfile: path.join(assetsDirectory, 'index.js'),
  platform: 'browser',
  plugins: [{
    name: 'ignore-css-imports',
    setup(build) {
      build.onResolve({filter: /\.css$/}, (args) => ({path: args.path, namespace: 'ignored-css'}));
      build.onLoad({filter: /.*/, namespace: 'ignored-css'}, () => ({contents: ''}));
    },
  }],
  sourcemap: false,
  target: ['es2022'],
});

execFileSync(tailwindCommand, [
  '--input', path.join(projectDirectory, 'src', 'index.css'),
  '--output', path.join(assetsDirectory, 'index.css'),
  '--minify',
], {stdio: 'inherit', cwd: projectDirectory, shell: process.platform === 'win32'});

const sourceHtml = fs.readFileSync(path.join(projectDirectory, 'index.html'), 'utf8');
const builtHtml = sourceHtml.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<link rel="stylesheet" href="/assets/index.css"><script type="module" src="/assets/index.js"></script>',
);

fs.writeFileSync(path.join(distDirectory, 'index.html'), builtHtml);