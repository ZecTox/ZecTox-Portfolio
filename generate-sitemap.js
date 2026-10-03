import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SITE_URL = 'https://zectox.is-a.dev';
const BLOG_DIR = path.join(process.cwd(), 'blog');
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

// Last time a file actually changed, from git where available (the working-tree
// mtime is meaningless on a fresh CI checkout).
const lastChanged = (file) => {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${file}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (iso) return iso.split('T')[0];
  } catch {
    /* not a git checkout, or the file is untracked */
  }
  return new Date(fs.statSync(file).mtime).toISOString().split('T')[0];
};

const routes = [
  { url: '/', priority: 1.0, changefreq: 'weekly', lastmod: lastChanged('index.html') },
  { url: '/blog', priority: 0.9, changefreq: 'weekly', lastmod: lastChanged('blog/index.html') },
];

if (fs.existsSync(BLOG_DIR)) {
  for (const file of fs.readdirSync(BLOG_DIR).sort()) {
    if (!file.endsWith('.html') || file === 'index.html') continue;

    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip anything explicitly excluded from the index: a sitemap must not
    // advertise URLs that tell Google to drop them.
    if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(content)) {
      console.warn(`   skipped (noindex): ${file}`);
      continue;
    }

    // Prefer the URL the page declares as canonical over one derived from the filename.
    const canonical = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const url = canonical
      ? canonical[1].replace(SITE_URL, '')
      : `/blog/${file.replace(/\.html$/, '')}`;

    const modified = content.match(/<meta\s+property=["']article:modified_time["']\s+content=["']([^"']+)["']/i);

    routes.push({
      url,
      priority: 0.8,
      changefreq: 'monthly',
      lastmod: modified ? modified[1].split('T')[0] : lastChanged(filePath),
    });
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((r) =>
    [
      '  <url>',
      `    <loc>${SITE_URL}${r.url}</loc>`,
      `    <lastmod>${r.lastmod}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n')
  ),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(SITEMAP_PATH, xml);
console.log(`✅ Sitemap generated with ${routes.length} URLs.`);
