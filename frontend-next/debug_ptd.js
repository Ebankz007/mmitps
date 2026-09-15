const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[PAGE_ERROR] ${error.message}`));

  try {
    await page.goto('http://localhost:3000/dashboard/resources/ptd/pro', { waitUntil: 'networkidle', timeout: 15000 });
    // wait a couple seconds for chart to mount
    await page.waitForTimeout(3000);
  } catch (err) {
    logs.push(`[GOTO_ERROR] ${err.message}`);
  }

  console.log(logs.join('\n'));
  await browser.close();
})();
