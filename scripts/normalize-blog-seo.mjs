import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://zectox.is-a.dev';
const AUTHOR_NAME = 'Tejas Kedare';
const PUBLISHER_NAME = 'Tejas Kedare Portfolio';
const PUBLISHER_LOGO = `${SITE_URL}/src/tejas_website_image.webp`;
const blogDir = path.join(process.cwd(), 'blog');

const blogFiles = (await readdir(blogDir))
  .filter((file) => file.endsWith('.html') && file !== 'index.html')
  .sort();

function stripTags(value = '') {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function escapeJsonString(value = '') {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function absoluteUrl(url = '') {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url.replace(/^\.?\//, '')}`;
}

function extractMatch(html, regex, group = 1) {
  const match = html.match(regex);
  return match ? match[group].trim() : '';
}

function parseSchemaBlocks(html) {
  const blocks = [];
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(regex)) {
    try {
      blocks.push({
        raw: match[0],
        json: JSON.parse(match[1]),
      });
    } catch {
      // Skip malformed JSON-LD blocks so the script remains non-destructive.
    }
  }

  return blocks;
}

function toIsoDate(raw) {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const dayMatch = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (dayMatch) {
    const date = new Date(`${dayMatch[1]} ${dayMatch[2]}, ${dayMatch[3]} UTC`);
    if (!Number.isNaN(date.valueOf())) {
      return date.toISOString().slice(0, 10);
    }
  }

  const monthMatch = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthMatch) {
    const date = new Date(`${monthMatch[1]} 1, ${monthMatch[2]} UTC`);
    if (!Number.isNaN(date.valueOf())) {
      return date.toISOString().slice(0, 10);
    }
  }

  return '';
}

function extractVisibleUpdatedDate(html) {
  const candidates = [
    extractMatch(html, /Updated:\s*([^<•]+)/i),
    extractMatch(html, /Last updated:\s*([^<•]+)/i),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const parsed = toIsoDate(candidate);
    if (parsed) return parsed;
  }

  return '';
}

function upsertTag(html, regex, tag, anchorRegex) {
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }

  return html.replace(anchorRegex, `${tag}\n$&`);
}

function prettyJson(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

let updatedCount = 0;

for (const file of blogFiles) {
  const filePath = path.join(blogDir, file);
  const original = await readFile(filePath, 'utf8');
  let html = original;

  const titleTag = stripTags(extractMatch(html, /<title>([\s\S]*?)<\/title>/i));
  const headline = stripTags(extractMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)) || titleTag.replace(/\s*-\s*Tejas Kedare(?: Portfolio)?$/i, '');
  const description = extractMatch(html, /<meta name="description"\s+content="([\s\S]*?)"\s*\/?>/i);
  const canonical = extractMatch(html, /<link rel="canonical"\s+href="([^"]+)"\s*\/?>/i);
  const schemaBlocks = parseSchemaBlocks(html);
  const blogPostingBlock = schemaBlocks.find((block) => block.json['@type'] === 'BlogPosting');
  const schemaImage = blogPostingBlock?.json?.image;
  const ogImage = extractMatch(html, /<meta property="og:image"\s+content="([^"]+)"\s*\/?>/i);
  const firstImage = extractMatch(html, /<img[^>]+src="([^"]+)"/i);
  const image = absoluteUrl(ogImage || schemaImage || firstImage);
  const pageStat = await stat(filePath);
  const fallbackDate = pageStat.mtime.toISOString().slice(0, 10);
  const visibleDate = extractVisibleUpdatedDate(html);
  const publishedDate = blogPostingBlock?.json?.datePublished || visibleDate || fallbackDate;
  const modifiedDate = visibleDate || blogPostingBlock?.json?.dateModified || fallbackDate;
  const cleanTitle = titleTag.replace(/\s*-\s*Tejas Kedare(?: Portfolio)?$/i, '').trim();
  const bodyText = stripTags(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  );
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
  const ogTitle = cleanTitle;
  const ogDescription = description;

  html = upsertTag(
    html,
    /<meta name="author"\s+content="[^"]*"\s*\/?>/i,
    `    <meta name="author" content="${AUTHOR_NAME}">`,
    /<link rel="icon"[\s\S]*?>/i
  );
  html = upsertTag(
    html,
    /<meta name="robots"\s+content="[^"]*"\s*\/?>/i,
    '    <meta name="robots" content="index,follow,max-image-preview:large">',
    /<link rel="icon"[\s\S]*?>/i
  );
  html = upsertTag(
    html,
    /<meta property="og:type"\s+content="[^"]*"\s*\/?>/i,
    '    <meta property="og:type" content="article">',
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="og:title"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="og:title" content="${escapeJsonString(ogTitle)}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="og:description"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="og:description" content="${escapeJsonString(ogDescription)}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="og:url"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="og:url" content="${canonical}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="og:image"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="og:image" content="${image}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="og:site_name"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="og:site_name" content="${PUBLISHER_NAME}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta name="twitter:card"\s+content="[\s\S]*?"\s*\/?>/i,
    '    <meta name="twitter:card" content="summary_large_image">',
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta name="twitter:title"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta name="twitter:title" content="${escapeJsonString(ogTitle)}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta name="twitter:description"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta name="twitter:description" content="${escapeJsonString(ogDescription)}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta name="twitter:image"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta name="twitter:image" content="${image}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="article:published_time"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="article:published_time" content="${publishedDate}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );
  html = upsertTag(
    html,
    /<meta property="article:modified_time"\s+content="[\s\S]*?"\s*\/?>/i,
    `    <meta property="article:modified_time" content="${modifiedDate}">`,
    /<script>\(function\(w,d,s,l,i\)/i
  );

  const normalizedBlogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    image,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO,
      },
    },
    mainEntityOfPage: canonical,
    wordCount,
    description,
  };

  const blogPostingScript = `    <script type="application/ld+json">\n${prettyJson(normalizedBlogPosting)
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')}\n    </script>`;

  if (blogPostingBlock) {
    const updatedPosting = {
      ...blogPostingBlock.json,
      headline,
      image: image || blogPostingBlock.json.image,
      datePublished: blogPostingBlock.json.datePublished || publishedDate,
      dateModified: modifiedDate,
      author: blogPostingBlock.json.author || normalizedBlogPosting.author,
      publisher: blogPostingBlock.json.publisher || normalizedBlogPosting.publisher,
      mainEntityOfPage: canonical,
      wordCount,
      description,
    };

    const updatedScript = `    <script type="application/ld+json">\n${prettyJson(updatedPosting)
      .split('\n')
      .map((line) => `    ${line}`)
      .join('\n')}\n    </script>`;

    html = html.replace(blogPostingBlock.raw, updatedScript);
  } else {
    if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/i.test(html)) {
      html = html.replace(/(\s*<script type="application\/ld\+json">[\s\S]*?<\/script>)/i, `$1\n${blogPostingScript}`);
    } else {
      html = html.replace(/(\s*<!-- Google Tag Manager -->)/i, `\n${blogPostingScript}\n$1`);
    }
  }

  if (html !== original) {
    await writeFile(filePath, html);
    updatedCount += 1;
  }
}

console.log(`Normalized SEO metadata for ${updatedCount} blog articles.`);
