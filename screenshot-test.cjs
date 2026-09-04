const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto('https://zectox.is-a.dev/', { waitUntil: 'networkidle' });
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'before_click.png' });
  
  const btn = await page.$('.view-page-btn.glightbox');
  if (btn) {
    console.log('Clicking button...');
    await btn.click();
    await page.waitForTimeout(3000); // wait for animation
    await page.screenshot({ path: 'after_click.png' });
  } else {
    console.log('Button not found');
  }
  
  await browser.close();
})();
