const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://zectox.is-a.dev/', { waitUntil: 'networkidle' });
  const btn = await page.$('.view-page-btn.glightbox');
  if (btn) {
    await btn.click();
    await page.waitForTimeout(2000);
    // Click the next button
    const nextBtn = await page.$('.gnext');
    if (nextBtn) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'after_next.png' });
    }
  }
  await browser.close();
})();
