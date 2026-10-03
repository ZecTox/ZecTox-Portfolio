/**
 * hash-assets.mjs
 *
 * Vite content-hashes the bundled CSS, but script.js, the Font Awesome stylesheet
 * and the icon fonts are copied verbatim out of public/ and keep stable names.
 * They were being served `immutable, max-age=31536000`, so a returning visitor
 * kept a year-old copy forever: new HTML paired with stale JS (dead CTAs) and a
 * stale font subset (blank icons). Renaming them by content hash means the URL
 * changes whenever the bytes change, which is what makes `immutable` safe.
 *
 * Runs as part of `npm run build`, after vite. Operates on dist/ only.
 */
import { readFile, writeFile, readdir, rename, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DIST = 'dist';
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);

const htmlFiles = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir)) {
    const p = path.join(dir, entry);
    if ((await stat(p)).isDirectory()) out.push(...(await htmlFiles(p)));
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
};

const rewrites = new Map(); // original public path -> hashed public path

// 1. Icon fonts first: the Font Awesome stylesheet references them.
const fontDir = path.join(DIST, 'webfonts');
if (existsSync(fontDir)) {
  for (const f of await readdir(fontDir)) {
    if (!f.endsWith('.woff2') || /\.[0-9a-f]{8}\.woff2$/.test(f)) continue;
    const abs = path.join(fontDir, f);
    const h = hash(await readFile(abs));
    const hashed = f.replace(/\.woff2$/, `.${h}.woff2`);
    await rename(abs, path.join(fontDir, hashed));
    rewrites.set(`/webfonts/${f}`, `/webfonts/${hashed}`);
  }
}

// 2. The Font Awesome stylesheet, with its font urls updated before hashing.
const faPath = path.join(DIST, 'css', 'all.min.css');
if (existsSync(faPath)) {
  let css = await readFile(faPath, 'utf8');
  for (const [from, to] of rewrites) {
    css = css.split(`../webfonts/${path.basename(from)}`).join(`../webfonts/${path.basename(to)}`);
  }
  const h = hash(Buffer.from(css));
  const hashed = `all.${h}.min.css`;
  await writeFile(path.join(DIST, 'css', hashed), css);
  rewrites.set('/css/all.min.css', `/css/${hashed}`);
}

// 3. The site bundle.
const jsPath = path.join(DIST, 'script.js');
if (existsSync(jsPath)) {
  const buf = await readFile(jsPath);
  const hashed = `script.${hash(buf)}.js`;
  await writeFile(path.join(DIST, hashed), buf);
  rewrites.set('/script.js', `/${hashed}`);
}

// 4. Point every page at the hashed names.
let touched = 0;
for (const file of await htmlFiles(DIST)) {
  let s = await readFile(file, 'utf8');
  const before = s;
  for (const [from, to] of rewrites) s = s.split(from).join(to);
  if (s !== before) {
    await writeFile(file, s);
    touched++;
  }
}

for (const [from, to] of rewrites) console.log(`  ${from}  ->  ${to}`);
console.log(`Hashed ${rewrites.size} assets, rewrote ${touched} pages.`);
