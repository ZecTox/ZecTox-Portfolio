/**
 * validate-build.mjs
 *
 * Post-build gate over dist/. Catches the SEO and markup regressions that are easy
 * to introduce across 45 hand-maintained HTML files and invisible until Search
 * Console reports them weeks later.
 *
 * Run after `npm run build`:  npm run validate
 *
 * Checks, per page: JSON-LD parses; exactly one <h1>; title <= 65 and description
 * <= 165 characters; titles and descriptions unique; exactly one canonical with no
 * trailing slash; every <img> has alt, width and height and is not hotlinked; every
 * referenced local asset exists; every internal link resolves and carries no
 * trailing slash; og/twitter tags present exactly once and their images resolve;
 * target="_blank" links carry rel="noopener". Finally: the sitemap and the set of
 * canonical URLs must match exactly.
 */
import fs from 'fs';
import path from 'path';

const SITE = 'https://zectox.is-a.dev';
const DIST = 'dist';
const problems = [];
const fail = (f, msg) => problems.push(`${f}: ${msg}`);

const pages = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d)) {
    const p = path.join(d, e);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) pages.push(p);
  }
};
walk(DIST);

const canon = new Map(), titles = new Map(), descs = new Map();

for (const p of pages) {
  const s = fs.readFileSync(p, 'utf8');
  const rel = p.replace(DIST, '') || '/';
  const noindex = /<meta\s+name=["']robots["'][^>]*noindex/i.test(s);

  // --- JSON-LD ---
  for (const [i, m] of [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].entries()) {
    try { JSON.parse(m[1]); } catch (e) { fail(rel, `JSON-LD block ${i} invalid: ${e.message}`); }
  }

  // --- title / description ---
  const t = s.match(/<title>([\s\S]*?)<\/title>/);
  if (!t) fail(rel, 'no <title>');
  else {
    const txt = t[1].trim();
    if (txt.length > 65) fail(rel, `title ${txt.length} chars (>65, will truncate in SERPs)`);
    if (!noindex && titles.has(txt)) fail(rel, `duplicate title with ${titles.get(txt)}`);
    if (!noindex) titles.set(txt, rel);
  }
  const d = s.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/);
  if (!d) fail(rel, 'no meta description');
  else {
    const txt = d[1].replace(/\s+/g, ' ').trim();
    if (txt.length > 165) fail(rel, `description ${txt.length} chars (>165)`);
    if (!noindex && txt.length < 50) fail(rel, `description only ${txt.length} chars`);
    if (!noindex && descs.has(txt)) fail(rel, `duplicate description with ${descs.get(txt)}`);
    if (!noindex) descs.set(txt, rel);
  }

  // --- canonical ---
  const cs = [...s.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)].map(m => m[1]);
  if (!noindex) {
    if (cs.length === 0) fail(rel, 'no canonical');
    else if (cs.length > 1) fail(rel, `${cs.length} canonicals`);
    else {
      if (cs[0].endsWith('/') && cs[0] !== SITE + '/') fail(rel, `canonical has trailing slash: ${cs[0]}`);
      if (canon.has(cs[0])) fail(rel, `canonical collides with ${canon.get(cs[0])}`);
      canon.set(cs[0], rel);
    }
  }

  // --- headings ---
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(rel, `${h1} <h1> elements (want exactly 1)`);

  // --- images ---
  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    const src = (tag.match(/src="([^"]+)"/) || [])[1] || '?';
    if (!/alt="[^"]+"/.test(tag) && !/alt=""/.test(tag)) fail(rel, `img without alt: ${src}`);
    if (!/width=/.test(tag) || !/height=/.test(tag)) fail(rel, `img without width/height (CLS risk): ${src}`);
    if (/^https?:/.test(src)) fail(rel, `hotlinked image: ${src.slice(0, 60)}`);
  }

  // --- local asset references actually exist ---
  for (const m of s.matchAll(/(?:src|href)="(\/[^"#?]+\.(?:webp|png|jpe?g|css|js|pdf|xml|json|webmanifest|woff2))"/g)) {
    const target = path.join(DIST, decodeURIComponent(m[1]));
    if (!fs.existsSync(target)) fail(rel, `missing asset: ${m[1]}`);
  }

  // --- internal page links resolve (cleanUrls) ---
  for (const m of s.matchAll(/href="(\/[^":?#]*)"/g)) {
    const href = m[1];
    if (/\.[A-Za-z0-9]{2,12}$/.test(href)) continue;
    const candidates = [
      path.join(DIST, href === '/' ? 'index.html' : href + '.html'),
      path.join(DIST, href, 'index.html'),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) fail(rel, `internal link 404s: ${href}`);
    if (href !== '/' && href.endsWith('/')) fail(rel, `internal link has trailing slash (308 redirect): ${href}`);
  }

  // --- social tags ---
  if (!noindex) {
    for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
      const count = [...s.matchAll(new RegExp(`<meta\\s+(?:property|name)="${tag}"`, 'g'))].length;
      if (count === 0) fail(rel, `missing ${tag}`);
      if (count > 1) fail(rel, `${count}x ${tag}`);
    }
    for (const m of s.matchAll(/(?:og|twitter):image"\s+content="([^"]+)"/g)) {
      const u = m[1];
      if (!u.startsWith(SITE)) { fail(rel, `off-site social image: ${u.slice(0, 50)}`); continue; }
      if (!fs.existsSync(path.join(DIST, decodeURIComponent(u.replace(SITE, ''))))) fail(rel, `social image 404s: ${u.replace(SITE, '')}`);
    }
  }

  // --- new-tab links carry rel ---
  for (const m of s.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(m[0])) fail(rel, `target=_blank without noopener`);
  }
}

// --- sitemap vs canonicals ---
const sm = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const l of locs) if (!canon.has(l)) fail('sitemap.xml', `lists ${l} but no page declares it canonical`);
for (const c of canon.keys()) if (!locs.includes(c)) fail('sitemap.xml', `missing canonical URL ${c}`);
if (new Set(locs).size !== locs.length) fail('sitemap.xml', 'duplicate <loc> entries');

console.log(`Checked ${pages.length} pages, ${locs.length} sitemap URLs.\n`);
if (!problems.length) console.log('No problems found.');
else {
  console.log(`${problems.length} problems:\n`);
  for (const p of problems) console.log('  ' + p);
}
