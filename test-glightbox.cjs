const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => { errors.push(err.message); });
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('https://zectox.is-a.dev/', { waitUntil: 'networkidle' });
  console.log('Page loaded. Checking glightbox elements...');
  const elements = await page.$$('.glightbox');
  console.log('Found glightbox elements:', elements.length);
  const btn = await page.$('.view-page-btn.glightbox');
  if (btn) {
    console.log('Clicking button...');
    await btn.click();
    await page.waitForTimeout(2000);
    const container = await page.$('.glightbox-container');
    console.log('Lightbox container exists?', !!container);
    if (container) {
        const visible = await container.isVisible();
        console.log('Lightbox container visible?', visible);
    }
  }
  console.log('Errors:', errors);
  await browser.close();
})();
