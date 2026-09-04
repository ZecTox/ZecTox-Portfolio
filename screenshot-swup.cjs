const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto('https://zectox.is-a.dev/blog/shopify-seo-guide-2025.html', { waitUntil: 'networkidle' });
  
  const logo = await page.$('a.logo');
  if (logo) {
    await logo.click();
    await page.waitForTimeout(3000); 
    await page.screenshot({ path: 'after_logo_click.png' });
    const text = await page.evaluate(() => document.body.innerText);
    console.log("Page text snippet:", text.substring(0, 100));
  }
  
  await browser.close();
})();
