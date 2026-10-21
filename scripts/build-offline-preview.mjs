import { build } from 'vite';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = '/tmp/pbdy-offline-build';
await build({
  root,
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
let html = await readFile(path.join(outputDirectory, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
for (const match of scripts) {
  const js = await readFile(path.join(outputDirectory, match[1]), 'utf8');
  html = html.replace(match[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
}
const styles = [...html.matchAll(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/g)];
for (const match of styles) {
  const css = await readFile(path.join(outputDirectory, match[1]), 'utf8');
  html = html.replace(match[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}
const mime = { '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf' };
for (const folder of ['images', 'fonts']) {
  for (const name of await readdir(path.join(root, 'public', folder))) {
    const type = mime[path.extname(name)];
    if (!type) continue;
    const url = `/${folder}/${name}`;
    if (!html.includes(url)) continue;
    const bytes = await readFile(path.join(root, 'public', folder, name));
    html = html.replaceAll(url, `data:${type};base64,${bytes.toString('base64')}`);
  }
}
const output = '/workspace/PBDY-preview.html';
await writeFile(output, html);
console.log(`Standalone preview: ${output} (${Buffer.byteLength(html)} bytes)`);
