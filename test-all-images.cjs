const { chromium } = require('playwright');
const https = require('https');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('response', response => {
    if (response.status() >= 400 && response.request().resourceType() === 'image') {
      errors.push(`${response.status()} - ${response.url()}`);
    }
  });

  await page.goto('https://zectox.is-a.dev/', { waitUntil: 'networkidle' });
  
  // Click all glightbox links to trigger image loads
  const links = await page.$$('.view-page-btn.glightbox');
  for (const link of links) {
    await link.click();
    await page.waitForTimeout(1000);
    // Click next a few times
    let next = await page.$('.gnext');
    for (let i = 0; i < 4; i++) {
      if (next) {
        await next.click();
        await page.waitForTimeout(500);
      }
    }
    // Close lightbox
    const close = await page.$('.gclose');
    if (close) await close.click();
    await page.waitForTimeout(500);
  }
  
  console.log("Image 404 Errors:", errors.length ? errors : "None");
  await browser.close();
})();
