/**
 * fix-breadcrumb-schema.mjs
 *
 * Ensures every blog post has exactly ONE BreadcrumbList JSON-LD block.
 *  - Injects a BreadcrumbList if missing.
 *  - Removes duplicates if more than one exists.
 *
 * Run:  node scripts/fix-breadcrumb-schema.mjs
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://zectox.is-a.dev';
const blogDir = path.join(process.cwd(), 'blog');

const blogFiles = (await readdir(blogDir))
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .sort();

function slugToLabel(slug) {
  return slug
    .replace(/\.html$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(2025|2026)\b/, '$1')
    .replace(/\bSeo\b/gi, 'SEO')
    .replace(/\bPos\b/gi, 'POS')
    .replace(/\bAr\b/gi, 'AR')
    .replace(/\b3d\b/gi, '3D')
    .replace(/\bUi\b/gi, 'UI')
    .replace(/\bB2b\b/gi, 'B2B')
    .replace(/\bCro\b/gi, 'CRO')
    .replace(/\bTco\b/gi, 'TCO')
    .replace(/\bVs\b/gi, 'vs');
}

function buildBreadcrumbScript(slug) {
  const canonical = `${SITE_URL}/blog/${slug.replace(/\.html$/, '')}`;
  const label = slugToLabel(slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
      { '@type': 'ListItem', position: 3, name: label, item: canonical },
    ],
  };

  const json = JSON.stringify(schema, null, 2)
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');

  return `    <script type="application/ld+json">\n${json}\n    </script>`;
}

let fixedCount = 0;
let addedCount = 0;
let dupesRemoved = 0;

for (const file of blogFiles) {
  const filePath = path.join(blogDir, file);
  const original = await readFile(filePath, 'utf8');
  let html = original;

  // Find all real (non-HTML-escaped) ld+json blocks
  const ldJsonRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  const allBlocks = [...html.matchAll(ldJsonRegex)];

  const breadcrumbBlocks = [];
  for (const match of allBlocks) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed['@type'] === 'BreadcrumbList') {
        breadcrumbBlocks.push({ raw: match[0], index: match.index });
      }
    } catch {
      // skip malformed
    }
  }

  // --- Case 1: No BreadcrumbList — inject one after the last ld+json block ---
  if (breadcrumbBlocks.length === 0) {
    const script = buildBreadcrumbScript(file);

    // Find the BlogPosting ld+json block and inject after it
    const blogPostingMatch = [...html.matchAll(ldJsonRegex)].find((m) => {
      try { return JSON.parse(m[1])['@type'] === 'BlogPosting'; } catch { return false; }
    });

    if (blogPostingMatch) {
      const insertPos = blogPostingMatch.index + blogPostingMatch[0].length;
      html = html.slice(0, insertPos) + '\n' + script + html.slice(insertPos);
      addedCount++;
    }
  }

  // --- Case 2: More than one BreadcrumbList — keep only the first, remove the rest ---
  if (breadcrumbBlocks.length > 1) {
    // Remove from last to first so indices stay valid
    for (let i = breadcrumbBlocks.length - 1; i >= 1; i--) {
      const block = breadcrumbBlocks[i];
      // Also remove any surrounding whitespace/newlines
      const before = html.lastIndexOf('\n', block.index);
      const after = html.indexOf('\n', block.index + block.raw.length);
      html = html.slice(0, before) + html.slice(after);
      dupesRemoved++;
    }
  }

  if (html !== original) {
    await writeFile(filePath, html);
    fixedCount++;
  }
}

console.log(`BreadcrumbList schema fix complete:`);
console.log(`  ${addedCount} added, ${dupesRemoved} duplicates removed, ${fixedCount} files updated.`);
