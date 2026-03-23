import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://zectox.is-a.dev';
const BLOG_DIR = path.join(process.cwd(), 'blog');
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

// Static priority routes
const routes = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/blog', priority: 0.9, changefreq: 'weekly' }
];

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Scan the blog directory for HTML files
if (fs.existsSync(BLOG_DIR)) {
  const files = fs.readdirSync(BLOG_DIR);
  
  files.forEach(file => {
    // Exclude the blog index file since we added it manually
    if (file.endsWith('.html') && file !== 'index.html') {
      const filePath = path.join(BLOG_DIR, file);
      const stat = fs.statSync(filePath);
      
      // Remove .html extension for clean URL compatible with canonical tags
      const slug = file.replace('.html', '');
      
      routes.push({
        url: `/blog/${slug}`,
        priority: 0.8,
        changefreq: 'monthly',
        lastmod: formatDate(stat.mtime)
      });
    }
  });
}

// Generate XML content
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

routes.forEach(route => {
  xml += `  <url>\n`;
  xml += `    <loc>${SITE_URL}${route.url}</loc>\n`;
  
  if (route.lastmod) {
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
  } else {
    // Fallback static routes to today's date if not specified
    xml += `    <lastmod>${formatDate(new Date())}</lastmod>\n`;
  }
  
  xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
  xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>\n`;

// Write directly to public/sitemap.xml
fs.writeFileSync(SITEMAP_PATH, xml);
console.log(`✅ Sitemap successfully generated with ${routes.length} URLs!`);
