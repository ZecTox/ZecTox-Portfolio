import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'blog');
const files = (await readdir(blogDir))
  .filter((file) => file.endsWith('.html') && file !== 'index.html')
  .sort();

const contentBySlug = new Map();

function slugFromFile(file) {
  return file.replace(/\.html$/, '');
}

function titleCaseFromHtml(html, fallback) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : fallback;
}

for (const file of files) {
  const html = await readFile(path.join(blogDir, file), 'utf8');
  const slug = slugFromFile(file);
  contentBySlug.set(slug, {
    file,
    title: titleCaseFromHtml(html, slug),
  });
}

const topicGroups = [
  [
    'shopify-speed-optimization-guide',
    'why-is-my-shopify-store-slow',
    'shopify-technical-seo-checklist-2026',
    'page-builders-seo-guide',
    'shopify-cro-playbook',
    'common-shopify-issues-and-fixes',
    'shopify-speed-score-dropped-2026',
  ],
  [
    'custom-shopify-theme-benefits',
    'shopify-theme-vs-custom-development',
    'how-to-hire-shopify-developer-guide',
    'shopify-ultimate-ecommerce-development-guide-2026',
    'shopify-technical-audit-guide',
  ],
  [
    'shopify-headless-hydrogen-guide-2026',
    'shopify-checkout-extensibility-guide',
    'shopify-functions-vs-scripts-migration-guide',
    'shopify-functions-metaobjects-update-2026',
    'shopify-metaobjects-complete-guide-2026',
    'shopify-combined-listings-guide-2026',
    'shopify-custom-shipping-rates-guide',
  ],
  [
    'shopify-b2b-wholesale-guide-2025',
    'shopify-markets-vs-multistore-architecture-2026',
    'shopify-markets-pro-global-guide',
    'shopify-agentic-storefronts-guide-2026',
    'shopify-unified-commerce-pos-guide-2026',
  ],
  [
    'bigcommerce-to-shopify-migration-guide',
    'woocommerce-to-shopify-migration-guide',
    'shopify-plus-migration-guide',
    'shopify-vs-bigcommerce-vs-wix-2026',
    'shopify-vs-magento-ops-reality-2026',
    'shopify-vs-woocommerce-tco-2026',
  ],
  [
    'shopify-app-conflicts-guide',
    'shopify-apps-to-delete-guide',
    'shopify-admin-down-login-issues',
    'shopify-store-launch-checklist-2026',
    'shopify-pre-checked-checkbox-removal-due-date-2026',
    'shopify-subscription-apps-comparison-2026',
  ],
];

const fallbackSlugs = [
  'shopify-technical-seo-checklist-2026',
  'shopify-ultimate-ecommerce-development-guide-2026',
  'shopify-markets-vs-multistore-architecture-2026',
  'shopify-functions-vs-scripts-migration-guide',
];

function relatedSlugsFor(slug) {
  const group = topicGroups.find((items) => items.includes(slug)) || [];
  const picks = group.filter((item) => item !== slug);

  for (const fallback of fallbackSlugs) {
    if (fallback !== slug && !picks.includes(fallback)) {
      picks.push(fallback);
    }
  }

  return picks
    .filter((item) => contentBySlug.has(item))
    .slice(0, 3);
}

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(blogDir, file);
  const original = await readFile(filePath, 'utf8');
  const slug = slugFromFile(file);
  const related = relatedSlugsFor(slug);

  if (related.length === 0) continue;

  const links = related
    .map((relatedSlug) => {
      const article = contentBySlug.get(relatedSlug);
      return `                            <a href="/blog/${relatedSlug}" class="related-reading-link">\n                                <span class="related-reading-label">Read next</span>\n                                <strong>${article.title}</strong>\n                            </a>`;
    })
    .join('\n');

  const block = `                    <section class="related-reading" aria-labelledby="related-reading-title">\n                        <div class="related-reading-header">\n                            <p class="related-reading-kicker">Continue reading</p>\n                            <h2 id="related-reading-title">Related Shopify Guides</h2>\n                            <p>Explore a few closely related articles so the research journey doesn't stop at one page.</p>\n                        </div>\n                        <div class="related-reading-grid">\n${links}\n                        </div>\n                    </section>`;

  let html = original;
  if (/<section class="related-reading"[\s\S]*?<\/section>/i.test(html)) {
    html = html.replace(/<section class="related-reading"[\s\S]*?<\/section>/i, block);
  } else {
    html = html.replace(/\s*<\/article>/i, `\n${block}\n                </article>`);
  }

  if (html !== original) {
    await writeFile(filePath, html);
    updatedCount += 1;
  }
}

console.log(`Injected related reading blocks into ${updatedCount} blog articles.`);
