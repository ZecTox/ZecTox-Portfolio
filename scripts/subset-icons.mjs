/**
 * subset-icons.mjs
 *
 * Font Awesome ships ~2,000 glyphs; this site uses ~54. The full faces are 232 KB
 * on every page load, so we serve subsets instead (~6 KB).
 *
 * Run this whenever you add an icon class that was not already in use, otherwise
 * the new icon renders as a blank box:
 *
 *     npm run build:icons
 *
 * It scans every HTML file plus public/script.js for `fas fa-*` / `fab fa-*`
 * classes, looks each one up in the Font Awesome stylesheet to get its codepoint,
 * and rewrites public/webfonts/*.woff2 from the upstream TTFs.
 *
 * Requires Python with fonttools + brotli:  pip3 install fonttools brotli
 */
import { readFile, readdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const FA_VERSION = '6.0.0';
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/${FA_VERSION}/webfonts`;
const FACES = [
  { key: 'fas', ttf: 'fa-solid-900.ttf', out: 'public/webfonts/fa-solid-900.woff2' },
  { key: 'fab', ttf: 'fa-brands-400.ttf', out: 'public/webfonts/fa-brands-400.woff2' },
];

const htmlFiles = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir)) {
    if (['node_modules', '.git', 'dist', 'public'].includes(entry)) continue;
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...(await htmlFiles(p)));
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
};

// .fa-home:before{content:"\f015"} -- selectors are often grouped
const codepoints = (css) => {
  const map = new Map();
  for (const m of css.matchAll(/((?:\.fa-[a-z0-9-]+:before,?)+)\{content:"\\([0-9a-fA-F]+)"\}/g)) {
    for (const [, name] of m[1].matchAll(/\.fa-([a-z0-9-]+):before/g)) {
      if (!map.has(name)) map.set(name, m[2].toUpperCase());
    }
  }
  return map;
};

const sources = [...(await htmlFiles('.')), 'public/script.js'];
const used = { fas: new Set(), fab: new Set() };
for (const f of sources) {
  const s = await readFile(f, 'utf8');
  for (const m of s.matchAll(/\b(fas|fab)\s+fa-([a-z0-9-]+)/g)) used[m[1]].add(m[2]);
  for (const m of s.matchAll(/fa-([a-z0-9-]+)\s+(fas|fab)\b/g)) used[m[2]].add(m[1]);
}

const map = codepoints(await readFile('public/css/all.min.css', 'utf8'));
const work = await mkdtemp(path.join(tmpdir(), 'fa-subset-'));
let failed = false;

try {
  for (const face of FACES) {
    const names = [...used[face.key]].sort();
    const unknown = names.filter((n) => !map.has(n));
    if (unknown.length) {
      console.error(`  ! no codepoint for: ${unknown.join(', ')}`);
      failed = true;
    }
    const unicodes = names.filter((n) => map.has(n)).map((n) => 'U+' + map.get(n));
    if (!unicodes.length) {
      console.log(`  ${face.key}: no icons in use, skipping`);
      continue;
    }

    const ttf = path.join(work, face.ttf);
    const res = await fetch(`${CDN}/${face.ttf}`);
    if (!res.ok) throw new Error(`fetch ${face.ttf}: HTTP ${res.status}`);
    await writeFile(ttf, Buffer.from(await res.arrayBuffer()));

    const before = existsSync(face.out) ? statSync(face.out).size : 0;
    execFileSync('python3', [
      '-m', 'fontTools.subset', ttf,
      `--unicodes=${unicodes.join(',')}`,
      '--flavor=woff2', '--layout-features=', '--no-hinting', '--desubroutinize',
      `--output-file=${face.out}`,
    ], { stdio: ['ignore', 'ignore', 'inherit'] });

    const after = statSync(face.out).size;
    console.log(
      `  ${face.key}: ${names.length} icons, ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB`
    );
  }
} finally {
  await rm(work, { recursive: true, force: true });
}

if (failed) {
  console.error('\nSome icon classes had no matching codepoint. They will render blank.');
  process.exit(1);
}
console.log('\nIcon subsets rebuilt.');
